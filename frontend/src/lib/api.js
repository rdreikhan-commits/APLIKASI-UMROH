/**
 * ═══════════════════════════════════════════
 * API CLIENT — Koneksi ke Laravel Backend
 * ═══════════════════════════════════════════
 */

const API_BASE = 'http://127.0.0.1:8000/api';

class ApiClient {
  constructor() {
    this.baseUrl = API_BASE;
  }

  getToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  setToken(token) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  setUser(user) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  getUser() {
    if (typeof window !== 'undefined') {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    }
    return null;
  }

  clearAuth() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Accept': 'application/json',
      ...options.headers,
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Don't set Content-Type for FormData (browser sets boundary auto)
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(url, { ...options, headers });
    const data = await res.json();

    if (!res.ok) {
      throw { status: res.status, ...data };
    }

    return data;
  }

  // ── AUTH ──
  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.data.token);
    this.setUser(data.data.user);
    return data;
  }

  async register(payload) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    this.setToken(data.data.token);
    this.setUser(data.data.user);
    return data;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch (e) { /* ignore */ }
    this.clearAuth();
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  async updateProfile(payload) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async uploadDokumen(formData) {
    return this.request('/auth/upload-dokumen', {
      method: 'POST',
      body: formData,
      headers: {},
    });
  }

  // ── KATALOG (PUBLIC) ──
  async getPaketList(params = '') {
    return this.request(`/katalog/paket${params ? '?' + params : ''}`);
  }

  async getPaketDetail(id) {
    return this.request(`/katalog/paket/${id}`);
  }

  async getJadwalList(params = '') {
    return this.request(`/katalog/jadwal${params ? '?' + params : ''}`);
  }

  async getJadwalDetail(id) {
    return this.request(`/katalog/jadwal/${id}`);
  }

  // ── JAMAAH BOOKING ──
  async getMyBookings() {
    return this.request('/jamaah/bookings');
  }

  async getBookingDetail(kode) {
    return this.request(`/jamaah/bookings/${kode}`);
  }

  async checkout(jadwalId, catatan = '') {
    return this.request('/jamaah/bookings', {
      method: 'POST',
      body: JSON.stringify({ jadwal_id: jadwalId, catatan_jamaah: catatan }),
    });
  }

  async uploadBuktiPembayaran(kodeBooking, formData) {
    return this.request(`/jamaah/bookings/${kodeBooking}/bayar`, {
      method: 'POST',
      body: formData,
      headers: {},
    });
  }

  async cancelBooking(kodeBooking) {
    return this.request(`/jamaah/bookings/${kodeBooking}/cancel`, {
      method: 'POST',
    });
  }

  // ── ADMIN TRAVEL ──
  async getAdminPaket() {
    return this.request('/admin/travel/paket');
  }
  async createPaket(payload) {
    return this.request('/admin/travel/paket', { method: 'POST', body: JSON.stringify(payload) });
  }
  async updatePaket(id, payload) {
    return this.request(`/admin/travel/paket/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  }
  async deletePaket(id) {
    return this.request(`/admin/travel/paket/${id}`, { method: 'DELETE' });
  }
  async getAdminJadwal() {
    return this.request('/admin/travel/jadwal');
  }
  async createJadwal(payload) {
    return this.request('/admin/travel/jadwal', { method: 'POST', body: JSON.stringify(payload) });
  }
  async updateJadwal(id, payload) {
    return this.request(`/admin/travel/jadwal/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  }
  async deleteJadwal(id) {
    return this.request(`/admin/travel/jadwal/${id}`, { method: 'DELETE' });
  }
  async getDokumenList(status = '') {
    return this.request(`/admin/travel/dokumen${status ? '?status_dokumen=' + status : ''}`);
  }
  async verifyDokumen(bookingId, payload) {
    return this.request(`/admin/travel/dokumen/${bookingId}/verify`, { method: 'POST', body: JSON.stringify(payload) });
  }
  async getManifest(jadwalId) {
    return this.request(`/admin/travel/manifest/${jadwalId}`);
  }

  // ── ADMIN KEUANGAN ──
  async getPembayaranList(status = '') {
    return this.request(`/admin/keuangan/pembayaran${status ? '?status=' + status : ''}`);
  }
  async getPembayaranDetail(id) {
    return this.request(`/admin/keuangan/pembayaran/${id}`);
  }
  async verifyPayment(id, catatan = '') {
    return this.request(`/admin/keuangan/pembayaran/${id}/verify`, {
      method: 'POST', body: JSON.stringify({ catatan }),
    });
  }
  async rejectPayment(id, alasan) {
    return this.request(`/admin/keuangan/pembayaran/${id}/reject`, {
      method: 'POST', body: JSON.stringify({ alasan_reject: alasan }),
    });
  }
  async getLaporanPendapatan(params = '') {
    return this.request(`/admin/keuangan/laporan/pendapatan${params ? '?' + params : ''}`);
  }

  // ── ADMIN PERLENGKAPAN ──
  async getMasterPerlengkapan() {
    return this.request('/admin/perlengkapan/master');
  }
  async createPerlengkapan(payload) {
    return this.request('/admin/perlengkapan/master', { method: 'POST', body: JSON.stringify(payload) });
  }
  async updatePerlengkapan(id, payload) {
    return this.request(`/admin/perlengkapan/master/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  }
  async deletePerlengkapan(id) {
    return this.request(`/admin/perlengkapan/master/${id}`, { method: 'DELETE' });
  }
  async getDistribusiList(params = '') {
    return this.request(`/admin/perlengkapan/distribusi${params ? '?' + params : ''}`);
  }
  async handoverEquipment(id, payload) {
    return this.request(`/admin/perlengkapan/distribusi/${id}/handover`, {
      method: 'POST', body: JSON.stringify(payload),
    });
  }
  async batchHandover(payload) {
    return this.request('/admin/perlengkapan/distribusi/batch-handover', {
      method: 'POST', body: JSON.stringify(payload),
    });
  }
  async getLaporanStok(jadwalId = '') {
    return this.request(`/admin/perlengkapan/laporan/stok${jadwalId ? '?jadwal_id=' + jadwalId : ''}`);
  }

  // ── MASTER DATA (Admin Travel) ──
  crud(base) {
    return {
      list: (p='') => this.request(`${base}${p?'?'+p:''}`),
      create: (d) => this.request(base, { method:'POST', body:JSON.stringify(d) }),
      update: (id,d) => this.request(`${base}/${id}`, { method:'PUT', body:JSON.stringify(d) }),
      delete: (id) => this.request(`${base}/${id}`, { method:'DELETE' }),
    };
  }
  get maskapai() { return this.crud('/admin/travel/maskapai'); }
  get hotel() { return this.crud('/admin/travel/hotel'); }
  get agent() { return this.crud('/admin/travel/agent'); }
  get karyawan() { return this.crud('/admin/travel/karyawan'); }
  get mitra() { return this.crud('/admin/travel/mitra'); }
  get layananCrud() { return this.crud('/admin/travel/layanan'); }

  // ── KEUANGAN — Pengeluaran, Pemasukan, Bonus ──
  get pengeluaran() { return this.crud('/admin/keuangan/pengeluaran'); }
  get pemasukan() { return this.crud('/admin/keuangan/pemasukan'); }
  async getBonusList(p='') { return this.request(`/admin/keuangan/bonus-agent${p?'?'+p:''}`); }
  async bayarBonus(id) { return this.request(`/admin/keuangan/bonus-agent/${id}/bayar`, { method:'POST' }); }
  async getLaporanKeuangan(p='') { return this.request(`/admin/keuangan/laporan/keuangan${p?'?'+p:''}`); }
}

const api = new ApiClient();
export default api;
