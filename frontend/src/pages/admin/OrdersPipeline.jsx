import { useState } from 'react';

const pipelineTabs = [
    { id: 'new', label: 'New', icon: '' },
    { id: 'accepted', label: 'Accepted', icon: '' },
    { id: 'cooking', label: 'Cooking', icon: '' },
    { id: 'delivered', label: 'Delivered', icon: '' },
    { id: 'cancelled', label: 'Cancelled', icon: '' },
];

const nextStatus = { new: 'accepted', accepted: 'cooking', cooking: 'delivered' };
const nextLabel = { new: 'Accept Order', accepted: 'Start Cooking', cooking: 'Dispatch' };
const nextClass = { new: 'accept', accepted: 'cook', cooking: 'deliver' };

function printOrder(order) {
    const itemsHtml = (order.items || []).map(item =>
        `<tr><td>${item.quantity}x</td><td>${item.title}${item.size ? ` (${item.size})` : ''}</td><td>Rs. ${item.price * item.quantity}</td></tr>`
    ).join('');
    const html = `<!DOCTYPE html><html><head><title>Order ${order._id?.slice(-8)}</title>
    <style>body{font-family:sans-serif;padding:24px}table{width:100%;border-collapse:collapse}td,th{padding:8px;border-bottom:1px solid #ddd}</style></head><body>
    <h2>Nizami — Kitchen Receipt</h2>
    <p><strong>${order.customerName || 'Guest'}</strong><br>Type: ${order.orderType === 'pickup' ? 'Pickup' : 'Delivery'}${order.deliveryFee ? ` · Delivery Rs. ${order.deliveryFee}` : ''}<br>Tel: ${order.customerPhone || '—'}${order.alternateMobile ? `<br>Alt: ${order.alternateMobile}` : ''}<br>${order.address || '—'}${order.landmark ? `<br>Landmark: ${order.landmark}` : ''}${order.customerEmail ? `<br>Email: ${order.customerEmail}` : ''}</p>
    <p>Order #${order._id?.slice(-8).toUpperCase()} · ${new Date(order.createdAt).toLocaleString()}</p>
    <table><thead><tr><th>Qty</th><th>Item</th><th>Amount</th></tr></thead><tbody>${itemsHtml}</tbody></table>
    <p><strong>Total: Rs. ${order.totalPrice?.toFixed(0)}</strong></p>
    <p>Status: ${order.status}</p>
    <script>window.print();window.onafterprint=()=>window.close()</script></body></html>`;
    const w = window.open('', '_blank', 'width=400,height=600');
    if (w) {
        w.document.write(html);
        w.document.close();
    }
}

function timeAgo(date) {
    const s = Math.floor((Date.now() - new Date(date)) / 1000);
    if (s < 60) return 'Just now';
    if (s < 3600) return Math.floor(s/60) + 'm ago';
    if (s < 86400) return Math.floor(s/3600) + 'h ago';
    return Math.floor(s/86400) + 'd ago';
}

export default function OrdersPipeline({ orders, onUpdateStatus }) {
    const [activeStatus, setActiveStatus] = useState('new');

    const filtered = orders.filter(o => o.status === activeStatus);
    const counts = {};
    pipelineTabs.forEach(t => { counts[t.id] = orders.filter(o => o.status === t.id).length; });

    return (
        <div className="orders-pipeline-container">
            <div className="section-header">
                <h2>Orders Pipeline</h2>
            </div>
            
            <div className="order-pipeline-tabs">
                {pipelineTabs.map(t => (
                    <button 
                        key={t.id} 
                        className={`pipeline-tab ${activeStatus === t.id ? 'active' : ''}`} 
                        onClick={() => setActiveStatus(t.id)}
                    >
                        {t.label} <span className="tab-count">{counts[t.id]}</span>
                    </button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <div className="empty-state">
                    <p>No {activeStatus} orders at the moment.</p>
                </div>
            ) : (
                <div className="order-cards">
                    {filtered.map(order => (
                        <div key={order._id} className="order-card">
                            <div className="order-card-header">
                                <div>
                                    <h4>{order.customerName || 'Guest Account'}</h4>
                                    <p className="order-id-sub">Order #{order._id?.slice(-8).toUpperCase()}</p>
                                </div>
                                <span className="order-time">{timeAgo(order.createdAt)}</span>
                            </div>
                            
                            <div className="order-contact-info">
                                <span><small>TYPE</small> {order.orderType === 'pickup' ? 'Pickup' : 'Delivery'}</span>
                                {order.customerPhone && <span><small>TEL</small> {order.customerPhone}</span>}
                                {order.alternateMobile && <span><small>ALT</small> {order.alternateMobile}</span>}
                                {order.address && <span><small>ADR</small> {order.address}</span>}
                                {order.landmark && <span><small>LMK</small> {order.landmark}</span>}
                                {order.customerEmail && <span><small>EMAIL</small> {order.customerEmail}</span>}
                            </div>

                            <ul className="order-card-items">
                                {order.items?.map((item, i) => (
                                    <li key={i}>
                                        <span className="item-qty">{item.quantity}x</span>
                                        <span className="item-name">
                                            {item.title}
                                            {item.size && <span className="item-size-badge-pipeline"> ({item.size})</span>}
                                        </span>
                                        <span className="item-price">Rs. {item.price * item.quantity}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="order-card-footer">
                                <div className="order-total-box">
                                    <small>GRAND TOTAL</small>
                                    <span className="order-total">Rs. {order.totalPrice?.toFixed(0)}</span>
                                </div>
                                
                                <div className="order-card-actions">
                                    <button
                                        type="button"
                                        className="order-action-btn print"
                                        onClick={() => printOrder(order)}
                                    >
                                        Print
                                    </button>
                                    {nextStatus[activeStatus] && (
                                        <button 
                                            type="button"
                                            className={`order-action-btn ${nextClass[activeStatus]}`} 
                                            onClick={() => onUpdateStatus(order._id, nextStatus[activeStatus])}
                                        >
                                            {nextLabel[activeStatus]}
                                        </button>
                                    )}
                                    {activeStatus !== 'cancelled' && activeStatus !== 'delivered' && (
                                        <button 
                                            type="button"
                                            className="order-action-btn cancel" 
                                            onClick={() => onUpdateStatus(order._id, 'cancelled')}
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

