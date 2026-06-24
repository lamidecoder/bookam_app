// ============================================================
// BOOKAM SECURITY UTILITIES
// ============================================================

// Rate limiter — prevents brute force on login/OTP
const attempts: Record<string, { count: number; firstAttempt: number }> = {};

export const RateLimiter = {
  // Max attempts within window (ms)
  check(key: string, maxAttempts = 5, windowMs = 15 * 60 * 1000): boolean {
    const now = Date.now();
    const record = attempts[key];

    if (!record || now - record.firstAttempt > windowMs) {
      attempts[key] = { count: 1, firstAttempt: now };
      return true; // allowed
    }

    if (record.count >= maxAttempts) return false; // blocked

    record.count++;
    return true; // allowed
  },

  reset(key: string) {
    delete attempts[key];
  },

  getRemainingTime(key: string, windowMs = 15 * 60 * 1000): number {
    const record = attempts[key];
    if (!record) return 0;
    const elapsed = Date.now() - record.firstAttempt;
    return Math.max(0, Math.ceil((windowMs - elapsed) / 60000));
  },
};

// Input validation
export const Validate = {
  email(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  },

  phone(phone: string): boolean {
    // Nigerian phone: 08x, 07x, 09x — 10 or 11 digits
    return /^0[789][01]\d{8}$/.test(phone.trim());
  },

  password(password: string): { valid: boolean; message: string } {
    if (password.length < 8) return { valid: false, message: 'Password must be at least 8 characters' };
    if (!/[A-Z]/.test(password)) return { valid: false, message: 'Password must contain at least one uppercase letter' };
    if (!/[0-9]/.test(password)) return { valid: false, message: 'Password must contain at least one number' };
    return { valid: true, message: '' };
  },

  fullName(name: string): boolean {
    return name.trim().length >= 2 && name.trim().includes(' ');
  },

  otp(otp: string): boolean {
    return /^\d{6}$/.test(otp);
  },

  // Sanitize — strip HTML/script injection
  sanitize(input: string): string {
    return input.replace(/<[^>]*>/g, '').trim();
  },
};

// Session helpers
export const Session = {
  isExpired(expiresAt: number): boolean {
    return Date.now() / 1000 > expiresAt;
  },
};
