import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { z } from "zod";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase Client Initialization
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const app = express();
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "recharge-super-secret";
const adminEmail = "vidsm3434@gmail.com";

// Auth Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
};

const checkAdmin = (req: any, res: any, next: any) => {
  const user = req.user;
  const isDesignatedAdmin = user?.email?.toLowerCase().trim() === adminEmail.toLowerCase().trim();
  const hasAdminRole = user?.role?.toLowerCase().trim() === 'admin';

  if (isDesignatedAdmin || hasAdminRole) {
    // Elevate in memory if needed
    if (!hasAdminRole) req.user.role = 'admin';
    next();
  } else {
    res.status(403).json({ error: "Forbidden: Admin access required" });
  }
};

// --- API Routes ---

// Signup
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { fullName, mobileNumber, email, dob, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const { data, error } = await supabase.from('users').insert([{
      full_name: fullName,
      mobile_number: mobileNumber,
      email,
      dob,
      password: hashedPassword,
      referral_code: referralCode
    }]).select();

    if (error) throw error;
    res.json({ success: true, userId: data[0].id });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  const { identifier, password } = req.body;
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .or(`email.eq.${identifier},mobile_number.eq.${identifier}`);

  const user = users?.[0];

  if (user && bcrypt.compareSync(password, user.password)) {
    // Fail-safe: Always ensure this email has admin role
    let role = user.role;
    if (user.email === adminEmail && role !== 'admin') {
      role = 'admin';
      await supabase.from('users').update({ role: 'admin' }).eq('id', user.id);
    }

    const token = jwt.sign({ id: user.id, role: role, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.full_name, email: user.email, role: role, balance: user.balance } });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

// Get Profile
app.get("/api/user/profile", authenticateToken, async (req: any, res) => {
  const { data: user, error } = await supabase
    .from('users')
    .select('id, full_name, mobile_number, email, dob, balance, role, kyc_status, mpin')
    .eq('id', req.user.id)
    .single();
    
  if (error) return res.status(404).json({ error: "User not found" });

  const responseJson = {
    ...user,
    hasMpin: !!user.mpin
  };
  delete responseJson.mpin; // Don't expose the actual MPIN

  // Update role in memory if it matches admin email
  if (user.email === adminEmail && user.role !== 'admin') {
    responseJson.role = 'admin';
    supabase.from('users').update({ role: 'admin' }).eq('id', user.id).then(() => {});
  }

  res.json(responseJson);
});

// Update Wallet (Offline Request)
app.post("/api/wallet/offline-request", authenticateToken, async (req: any, res) => {
  try {
    const { utrNumber, amount, paymentDate, upiId } = req.body;
    const { error } = await supabase.from('wallet_requests').insert([{
      user_id: req.user.id,
      utr_number: utrNumber,
      amount,
      payment_date: paymentDate,
      upi_id: upiId
    }]);
    
    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: "UTR Number already used or invalid data" });
  }
});

// Get User Transactions
app.get("/api/user/transactions", authenticateToken, async (req: any, res) => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false });
    
  res.json(data || []);
});

// Admin: Get All Users
app.get("/api/admin/users", authenticateToken, checkAdmin, async (req: any, res) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, full_name, mobile_number, email, balance, role, kyc_status');
    
  res.json(data || []);
});

// Admin: Get Wallet Requests
app.get("/api/admin/wallet-requests", authenticateToken, checkAdmin, async (req: any, res) => {
  const { data, error } = await supabase
    .from('wallet_requests')
    .select('*, users(full_name)')
    .eq('status', 'pending');
    
  const formattedData = data?.map((wr: any) => ({
    ...wr,
    user_name: wr.users?.full_name
  }));
    
  res.json(formattedData || []);
});

// Admin: Approve Wallet Request
app.post("/api/admin/wallet-requests/:id/approve", authenticateToken, checkAdmin, async (req: any, res) => {
  const requestId = req.params.id;
  
  const { data: request, error: fetchErr } = await supabase
    .from('wallet_requests')
    .select('*')
    .eq('id', requestId)
    .single();

  if (!request || request.status !== 'pending') return res.status(404).json({ error: "Request not found" });

  try {
    // Start atomic operations
    await supabase.rpc('increment_balance', { user_id: request.user_id, amount_to_add: request.amount });
    await supabase.from('wallet_requests').update({ status: 'approved' }).eq('id', requestId);
    await supabase.from('transactions').insert([{
      user_id: request.user_id,
      type: 'add_balance',
      amount: request.amount,
      description: `Offline Load (UTR: ${request.utr_number})`,
      status: 'success'
    }]);

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Recharge API (Mock)
app.post("/api/recharge/proceed", authenticateToken, async (req: any, res) => {
  const { mobile, operator, circle, amount, mpin } = req.body;
  
  const { data: user, error: userErr } = await supabase
    .from('users')
    .select('balance, mpin')
    .eq('id', req.user.id)
    .single();

  if (!user) return res.status(404).json({ error: "User not found" });
  if (user.mpin !== mpin) return res.status(400).json({ error: "Invalid MPIN" });
  if (user.balance < amount) return res.status(400).json({ error: "Insufficient balance" });

  const success = Math.random() > 0.05; 
  const status = success ? 'success' : 'failed';

  try {
    if (success) {
      await supabase.rpc('decrement_balance', { user_id: req.user.id, amount_to_sub: amount });
    }
    await supabase.from('transactions').insert([{
      user_id: req.user.id,
      type: 'recharge',
      amount,
      status,
      description: `${operator} Recharge`,
      operator,
      mobile
    }]);

    if (success) {
      res.json({ success: true, message: "Recharge successful" });
    } else {
      res.status(500).json({ error: "Recharge failed at operator side" });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// KYC Submission
app.post("/api/user/kyc", authenticateToken, async (req: any, res) => {
  const { aadhaar, pan } = req.body;
  const { error: kycErr } = await supabase.from('kyc_submissions').insert([{
    user_id: req.user.id,
    aadhaar_number: aadhaar,
    pan_number: pan
  }]);
  
  if (kycErr) return res.status(400).json({ error: kycErr.message });
  
  await supabase.from('users').update({ kyc_status: 'pending' }).eq('id', req.user.id);
  res.json({ success: true });
});

// Admin: Get KYC Submissions
app.get("/api/admin/kyc", authenticateToken, checkAdmin, async (req: any, res) => {
  const { data, error } = await supabase
    .from('kyc_submissions')
    .select('*, users(full_name, email)')
    .eq('status', 'pending');
    
  const formattedData = data?.map((ks: any) => ({
    ...ks,
    user_name: ks.users?.full_name,
    user_email: ks.users?.email
  }));
    
  res.json(formattedData || []);
});

// Forgot Password / MPIN Request
app.post("/api/support/request", async (req, res) => {
  const { identifier, type } = req.body;
  const isEmail = identifier.includes('@');
  
  const { error } = await supabase.from('support_requests').insert([{
    email: isEmail ? identifier : null,
    mobile: isEmail ? null : identifier,
    type
  }]);
  
  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true });
});

// Admin: Get Support Requests
app.get("/api/admin/support", authenticateToken, checkAdmin, async (req: any, res) => {
  const { data, error } = await supabase
    .from('support_requests')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
    
  res.json(data || []);
});

// Admin: Resolve Support Request
app.post("/api/admin/support/:id/resolve", authenticateToken, checkAdmin, async (req: any, res) => {
  await supabase.from('support_requests').update({ status: 'resolved' }).eq('id', req.params.id);
  res.json({ success: true });
});

// Get Settings
app.get("/api/settings", async (req, res) => {
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'logo_url')
    .single();
    
  res.json({ logo: data?.value || 'https://seeklogo.com/images/R/recharge-logo-7DA7D8A17F-seeklogo.com.png' });
});

// Admin: Update Logo
app.post("/api/admin/settings/logo", authenticateToken, checkAdmin, async (req: any, res) => {
  const { url } = req.body;
  await supabase.from('settings').update({ value: url }).eq('key', 'logo_url');
  res.json({ success: true });
});

// Admin: Update KYC Status
app.post("/api/admin/kyc/:id/status", authenticateToken, checkAdmin, async (req: any, res) => {
  const { status } = req.body; 
  const kycId = req.params.id;

  const { data: kyc, error: kycErr } = await supabase
    .from('kyc_submissions')
    .select('*')
    .eq('id', kycId)
    .single();

  if (!kyc) return res.status(404).json({ error: "KYC not found" });

  await supabase.from('kyc_submissions').update({ status }).eq('id', kycId);
  await supabase.from('users').update({ kyc_status: status }).eq('id', kyc.user_id);
  
  res.json({ success: true });
});

// Admin: Get Dashboard Stats
app.get("/api/admin/stats", authenticateToken, checkAdmin, async (req: any, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    { count: totalUsers },
    { count: totalTransactions },
    { data: transactions },
    { count: pendingWallet },
    { count: pendingKyc },
    { count: pendingSupport }
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('transactions').select('*', { count: 'exact', head: true }),
    supabase.from('transactions').select('amount, type, status, created_at'),
    supabase.from('wallet_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('kyc_submissions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('support_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending')
  ]);

  const todayTxs = transactions?.filter(t => new Date(t.created_at) >= today) || [];
  const totalRecharge = transactions?.filter(t => t.type === 'recharge' && t.status === 'success')
    .reduce((sum, t) => sum + t.amount, 0) || 0;
  
  // Commission is usually a separate transaction or calculated
  const totalCommission = transactions?.filter(t => t.type === 'commission').reduce((sum, t) => sum + t.amount, 0) || 0;

  res.json({
    totalUsers: totalUsers || 0,
    totalTransactions: totalTransactions || 0,
    todayTransactions: todayTxs.length,
    totalRecharge,
    totalCommission,
    pendingWallet: pendingWallet || 0,
    pendingKyc: pendingKyc || 0,
    pendingSupport: pendingSupport || 0
  });
});

// Admin: User Management (Add/Block)
app.post("/api/admin/users/:id/status", authenticateToken, checkAdmin, async (req: any, res) => {
  const { status } = req.body; // active, blocked
  await supabase.from('users').update({ role: status === 'blocked' ? 'blocked' : 'user' }).eq('id', req.params.id);
  res.json({ success: true });
});

// Admin: Plans Management
app.get("/api/admin/plans", authenticateToken, async (req: any, res) => {
  const { data } = await supabase.from('recharge_plans').select('*');
  res.json(data || []);
});

app.post("/api/admin/plans", authenticateToken, checkAdmin, async (req: any, res) => {
  const { operator, amount, validity, description, category } = req.body;
  await supabase.from('recharge_plans').insert([{ operator, amount, validity, description, category }]);
  res.json({ success: true });
});

// Admin: Commission Management
app.get("/api/admin/commissions", authenticateToken, async (req: any, res) => {
  const { data } = await supabase.from('commissions').select('*');
  res.json(data || []);
});

app.post("/api/admin/commissions", authenticateToken, checkAdmin, async (req: any, res) => {
  const { operator, percentage, flat_amount, type } = req.body;
  await supabase.from('commissions').upsert([{ operator, percentage, flat_amount, type }]);
  res.json({ success: true });
});

// Admin: Notifications
app.post("/api/admin/notifications", authenticateToken, checkAdmin, async (req: any, res) => {
  const { user_id, title, description } = req.body;
  await supabase.from('notifications').insert([{ user_id, title, description }]);
  res.json({ success: true });
});

// Admin: Settings (API Keys)
app.post("/api/admin/settings", authenticateToken, checkAdmin, async (req: any, res) => {
  const { key, value } = req.body;
  await supabase.from('settings').upsert([{ key, value }]);
  res.json({ success: true });
});

// Update MPIN
app.post("/api/user/mpin", authenticateToken, async (req: any, res) => {
  const { mpin, oldMpin } = req.body;
  if (!/^\d{4}$/.test(mpin)) return res.status(400).json({ error: "MPIN must be 4 digits" });
  
  // Fetch user to check if MPIN already exists
  const { data: user, error: fetchError } = await supabase
    .from('users')
    .select('mpin')
    .eq('id', req.user.id)
    .single();

  if (fetchError || !user) return res.status(404).json({ error: "User not found" });

  // If user has an existing MPIN, verify the old one
  if (user.mpin) {
    if (!oldMpin) return res.status(400).json({ error: "Old MPIN is required" });
    if (user.mpin !== oldMpin) return res.status(400).json({ error: "Invalid Old MPIN" });
  }

  const { error } = await supabase.from('users').update({ mpin }).eq('id', req.user.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true });
});

// Seed Admin User
async function seedAdmin() {
  const { data: existingAdmin } = await supabase.from('users').select('*').eq('email', adminEmail).single();
  
  if (!existingAdmin) {
    const hashedPassword = bcrypt.hashSync("admin123", 10);
    await supabase.from('users').insert([{
      full_name: "System Admin",
      mobile_number: "0000000000",
      email: adminEmail,
      dob: "1990-01-01",
      password: hashedPassword,
      role: "admin",
      kyc_status: "approved"
    }]);
    console.log("Admin seeded to Supabase");
  }
}

// Vite Middleware
async function startServer() {
  await seedAdmin();
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
