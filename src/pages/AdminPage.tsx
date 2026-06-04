import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, CheckCircle, XCircle, LogOut, Search, ExternalLink, Clock, RefreshCw,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { adminLogout, isAdminLoggedIn } from './AdminLoginPage';
import {
  listenAllPaymentRequests, approvePayment, rejectPayment,
  type PaymentRequest,
} from '../services/payment.service';
import { formatTime } from '../utils/storage';

type Tab = 'payments' | 'users';

export default function AdminPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('payments');
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<PaymentRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectModal, setRejectModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { if (!isAdminLoggedIn()) navigate('/admin', { replace: true }); }, [navigate]);
  useEffect(() => { const unsub = listenAllPaymentRequests(setRequests); return unsub; }, []);

  const handleLogout = () => { adminLogout(); navigate('/admin'); };
  const handleApprove = async (req: PaymentRequest) => {
    setActionLoading(true);
    try { await approvePayment(req.id, req.userId); setSelected(null); }
    finally { setActionLoading(false); }
  };
  const handleReject = async () => {
    if (!selected) return;
    setActionLoading(true);
    try { await rejectPayment(selected.id, rejectReason || 'Payment could not be verified'); setSelected(null); setRejectModal(false); setRejectReason(''); }
    finally { setActionLoading(false); }
  };

  const filtered = requests.filter(r => {
    if (filter !== 'all' && r.status !== filter) return false;
    const q = search.toLowerCase();
    return !q || r.payerName.toLowerCase().includes(q) || r.mobile.includes(q) || r.transactionId.toLowerCase().includes(q);
  });
  const stats = { total: requests.length, pending: requests.filter(r=>r.status==='pending').length, approved: requests.filter(r=>r.status==='approved').length, revenue: requests.filter(r=>r.status==='approved').reduce((s,r)=>s+r.amount,0) };
  const statusBadge = (s: string) => { if (s==='pending') return <Badge variant="yellow"><Clock size={10}/> Pending</Badge>; if (s==='approved') return <Badge variant="green"><CheckCircle size={10}/> Approved</Badge>; return <Badge variant="red"><XCircle size={10}/> Rejected</Badge>; };

  return (
    <div className="min-h-screen bg-gray-50 max-w-2xl mx-auto">
      <div className="bg-brand-gradient text-white px-4 pt-12 pb-4 flex items-center justify-between">
        <div><h1 className="text-xl font-extrabold">Admin Panel</h1><p className="text-white/70 text-xs">Matrimonial Connect</p></div>
        <button onClick={handleLogout} className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-xl text-sm font-semibold"><LogOut size={14}/> Logout</button>
      </div>

      <div className="grid grid-cols-4 gap-2 px-4 py-3">
        {[{label:'Total',value:stats.total},{label:'Pending',value:stats.pending,alert:stats.pending>0},{label:'Approved',value:stats.approved},{label:'Revenue',value:'Rs.'+stats.revenue.toLocaleString('en-IN')}].map(s=>(
          <div key={s.label} className={'rounded-2xl p-3 text-center '+(s.alert?'bg-amber-50 border border-amber-200':'bg-white')}>
            <p className={'text-xl font-extrabold '+(s.alert?'text-amber-600':'text-gray-900')}>{s.value}</p>
            <p className="text-[10px] text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex bg-white border-b border-gray-100 sticky top-0 z-20">
        {(['payments','users'] as Tab[]).map(t=>(
          <button key={t} onClick={()=>setTab(t)} className={'flex-1 py-3 text-sm font-semibold border-b-2 '+(tab===t?'border-pink-500 text-pink-600':'border-transparent text-gray-500')}>
            {t==='payments'?'Payment Requests':'Users'}
            {t==='payments'&&stats.pending>0&&<span className="ml-1.5 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{stats.pending}</span>}
          </button>
        ))}
      </div>

      <div className="px-4 py-4 pb-10">
        {tab==='payments'&&(<>
          <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
            {(['pending','approved','rejected','all'] as const).map(f=>(
              <button key={f} onClick={()=>setFilter(f)} className={'flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold capitalize '+(filter===f?'bg-pink-500 text-white':'bg-white text-gray-600 border border-gray-200')}>{f}</button>
            ))}
          </div>
          <div className="mb-3"><Input placeholder="Search name, mobile, UTR..." value={search} onChange={e=>setSearch(e.target.value)} prefix={<Search size={14} className="text-gray-400"/>}/></div>
          {filtered.length===0?(<div className="text-center py-12 text-gray-400"><RefreshCw size={36} className="mx-auto mb-3 opacity-30"/><p className="font-medium">No {filter} requests</p></div>):(
            <div className="space-y-3">{filtered.map(req=>(
              <button key={req.id} onClick={()=>setSelected(req)} className="w-full bg-white rounded-3xl p-4 shadow-sm text-left hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div><p className="font-bold text-gray-900">{req.payerName}</p><p className="text-xs text-gray-500">+91 {req.mobile}</p></div>
                  <div className="flex flex-col items-end gap-1">{statusBadge(req.status)}<p className="font-extrabold text-pink-600 text-sm">Rs.{req.amount}</p></div>
                </div>
                <div className="flex items-center justify-between">
                  <div><p className="text-xs text-gray-500 font-mono uppercase">{req.transactionId}</p><p className="text-[10px] text-gray-400 mt-0.5">{req.submittedAt?formatTime(req.submittedAt):''}</p></div>
                  <span className="text-xs font-semibold capitalize bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">{req.plan}</span>
                </div>
              </button>
            ))}</div>
          )}
        </>)}
        {tab==='users'&&(<div className="text-center py-16 text-gray-400"><Users size={40} className="mx-auto mb-3 opacity-30"/><p className="font-medium text-gray-600">User list loads from Firestore once Firebase is connected.</p></div>)}
      </div>

      {selected&&(
        <Modal open title="Payment Request" onClose={()=>setSelected(null)}>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {[{l:'Name',v:selected.payerName},{l:'Mobile',v:'+91 '+selected.mobile},{l:'Plan',v:selected.plan},{l:'Amount',v:'Rs.'+selected.amount}].map(i=>(
                <div key={i.l} className="bg-gray-50 rounded-2xl p-3"><p className="text-xs text-gray-500">{i.l}</p><p className="font-semibold text-gray-900 text-sm capitalize">{i.v}</p></div>
              ))}
            </div>
            <div className="bg-gray-50 rounded-2xl p-3"><p className="text-xs text-gray-500 mb-0.5">UTR / Transaction ID</p><p className="font-mono font-semibold text-gray-900 text-sm uppercase select-all">{selected.transactionId}</p></div>
            <div className="bg-gray-50 rounded-2xl p-3">
              <p className="text-xs text-gray-500 mb-2">Payment Screenshot</p>
              <img src={selected.screenshotUrl} alt="proof" className="w-full rounded-xl object-contain max-h-52 cursor-pointer" onClick={()=>window.open(selected.screenshotUrl,'_blank')}/>
              <a href={selected.screenshotUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-pink-600 font-medium mt-1.5"><ExternalLink size={11}/> Open full size</a>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-400 px-1"><span>Submitted {selected.submittedAt?formatTime(selected.submittedAt):''}</span>{statusBadge(selected.status)}</div>
            {selected.status==='pending'&&(<div className="flex gap-3 pt-2"><Button variant="danger" size="md" fullWidth onClick={()=>setRejectModal(true)} icon={<XCircle size={15}/>}>Reject</Button><Button size="md" fullWidth loading={actionLoading} onClick={()=>handleApprove(selected)} icon={<CheckCircle size={15}/>}>Approve</Button></div>)}
            {selected.status==='rejected'&&selected.rejectionReason&&(<div className="bg-red-50 border border-red-200 rounded-2xl p-3"><p className="text-xs text-red-600"><span className="font-semibold">Reason:</span> {selected.rejectionReason}</p></div>)}
          </div>
        </Modal>
      )}

      <Modal open={rejectModal} onClose={()=>setRejectModal(false)} title="Reason for Rejection">
        <p className="text-sm text-gray-500 mb-3">This will be shown to the user.</p>
        <div className="space-y-2 mb-4">
          {['Payment amount incorrect','UTR number mismatch','Screenshot unclear or fake','Could not verify payment'].map(r=>(
            <button key={r} onClick={()=>setRejectReason(r)} className={'w-full text-left text-sm px-4 py-2.5 rounded-2xl border '+(rejectReason===r?'border-red-400 bg-red-50 text-red-700':'border-gray-200 hover:bg-gray-50 text-gray-700')}>{r}</button>
          ))}
        </div>
        <div className="flex gap-3"><Button variant="ghost" size="md" fullWidth onClick={()=>setRejectModal(false)}>Cancel</Button><Button variant="danger" size="md" fullWidth loading={actionLoading} onClick={handleReject}>Confirm Reject</Button></div>
      </Modal>
    </div>
  );
}
