import React, { useEffect, useState } from 'react';
import { dashboardApi } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { useSidebar } from '../../contexts/SidebarContext';

// Import Urbanist font via Google Fonts
const urbanistFont = document.createElement('link');
urbanistFont.href = 'https://fonts.googleapis.com/css2?family=Urbanist:wght@400;600;700&display=swap';
urbanistFont.rel = 'stylesheet';
document.head.appendChild(urbanistFont);
document.body.style.fontFamily = 'Urbanist, sans-serif';

// Custom Gauge SVG
type GaugeProps = {
  percent: number;
  color: string;
  label: string;
  value: string | number;
  change: number;
};

const Gauge: React.FC<GaugeProps> = ({ percent, color, label, value, change }: GaugeProps) => (
  <div className="flex flex-col items-center gap-1">
    <svg width="80" height="40" viewBox="0 0 80 40">
      <path d="M10,40 A30,30 0 0,1 70,40" fill="none" stroke="#eee" strokeWidth="8" />
      <path d="M10,40 A30,30 0 0,1 70,40" fill="none" stroke={color} strokeWidth="8" strokeDasharray={`${percent * 94},94`} />
    </svg>
    <div className="text-xs text-[#808080]">{label}</div>
    <div className="text-lg font-bold text-[#262726]">{value}</div>
    <div className={`text-xs font-semibold flex items-center gap-1 ${change > 0 ? 'text-[#49FF61]' : 'text-[#FF6161]'}`}>{change > 0 ? '+' : ''}{change}%</div>
  </div>
);

const DashboardPro = () => {
  const [kpis, setKpis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isOpen, isMobile } = useSidebar();
  // Placeholder property data
  const bestProperty = {
    name: 'Green Oasis Residence',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    totalSales: 124,
    totalVisits: 539,
    address: '3284 Skyview Lane, VA 98001',
    type: 'Apartments',
    agent: 'John K.',
    cost: 692000,
    views: 1251,
    status: 'Active',
  };

  useEffect(() => {
    async function fetchKPIs() {
      try {
        const response = await dashboardApi.getKPIs();
        if (response.data && response.data.success) {
          setKpis(response.data.data);
        }
      } catch (err) {
        setError('Failed to load dashboard KPIs.');
      } finally {
        setLoading(false);
      }
    }
    fetchKPIs();
  }, []);

  // Bar chart data for average sale value
  const barData = [8, 7, 6, 8, 9, 10, 7, 8, 6, 7, 8, 9, 10, 11, 8, 7, 9];
  const maxBar = Math.max(...barData);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-[#FF6161]">{error}</div>;

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#f6fafd] to-[#f7f5e6] flex flex-col items-center transition-all duration-300"
      style={{
        fontFamily: 'Urbanist, sans-serif',
        marginLeft: !isMobile ? (isOpen ? 280 : 80) : 0,
        width: !isMobile ? `calc(100vw - ${isOpen ? 280 : 80}px)` : '100vw',
        maxWidth: '100vw',
      }}
    >
      <div className="max-w-screen-xl w-full mx-auto mt-8 rounded-3xl overflow-hidden shadow-xl border border-gray-200 bg-white relative transition-all duration-300">
        {/* Top Row: Main Goals */}
        <div className="flex flex-row gap-6 px-10 pt-8 pb-2 items-start">
          {/* Main Goals */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex flex-row gap-6 items-center">
              <div className="flex-1">
                <div className="flex flex-row gap-4 items-center">
                  <div className="flex-1">
                    <div className="text-xs text-[#808080] mb-1">Apartments sold</div>
                    <div className="text-2xl font-bold text-[#262726] mb-1">${kpis && typeof kpis.propertiesSoldThisMonth === 'number' ? (kpis.propertiesSoldThisMonth * 10000).toLocaleString() : '512,927.15'}</div>
                    <div className="w-full h-2 rounded-full bg-[#DAFC08]" style={{ width: '80%' }}></div>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-[#808080] mb-1">Apartments rented</div>
                    <div className="text-2xl font-bold text-[#262726] mb-1">$360,494.24</div>
                    <div className="w-full h-2 rounded-full bg-[#808080]/20" style={{ width: '60%' }}></div>
                  </div>
                  <div className="flex-1 flex flex-row items-center justify-end gap-2">
                    <select className="rounded-xl border border-[#808080]/30 px-3 py-1 text-xs bg-white">
                      <option>Monthly</option>
                    </select>
                  </div>
                </div>
              </div>
              {/* AI Feature CTA */}
              <div className="relative flex flex-col items-center justify-center w-72 h-32 bg-gradient-to-br from-[#fffde4] to-[#DAFC08] rounded-2xl border border-[#262726] overflow-hidden ml-8">
                <div className="absolute right-4 top-4 flex flex-row gap-2">
                  <img src="https://randomuser.me/api/portraits/men/32.jpg" className="w-8 h-8 rounded-full border-2 border-white" alt="avatar" />
                  <img src="https://randomuser.me/api/portraits/women/44.jpg" className="w-8 h-8 rounded-full border-2 border-white" alt="avatar" />
                  <img src="https://randomuser.me/api/portraits/men/45.jpg" className="w-8 h-8 rounded-full border-2 border-white" alt="avatar" />
                </div>
                <div className="absolute right-0 top-0 w-24 h-24 bg-[#DAFC08] rounded-full opacity-30 blur-2xl" />
                <h3 className="text-lg font-bold text-[#262726] mb-1 mt-2">Leads and Property Search</h3>
                <p className="text-xs text-[#808080] mb-2 text-center">Optimize your time and increase efficiency with our integrated leads and property search feature.</p>
                <Button className="bg-[#262726] text-white rounded-full px-6 py-2 text-xs">Search now</Button>
              </div>
            </div>
          </div>
        </div>
        {/* Middle Row: Left Stats, Center Card, Right Chart */}
        <div className="flex flex-row gap-6 px-10 mt-2">
          {/* Left Column: Completed Deals, Total Revenue */}
          <div className="flex flex-col gap-4 w-56">
            <Gauge percent={0.36} color="#FF6161" label="Completed Deals" value={kpis && typeof kpis.leadsConvertedThisMonth === 'number' ? kpis.leadsConvertedThisMonth : '1,269'} change={-36} />
            <Gauge percent={0.49} color="#DAFC08" label="Total Revenue" value={kpis && typeof kpis.revenueThisMonth === 'number' ? kpis.revenueThisMonth.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : '873,421.39'} change={49} />
          </div>
          {/* Center Card: Best Apartments */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex flex-row gap-4">
              <div className="flex-1 bg-[#DAFC08] rounded-2xl flex flex-row overflow-hidden border border-[#262726]">
                <img src={bestProperty.image} alt="property" className="w-48 h-48 object-cover rounded-l-2xl" />
                <div className="flex flex-col justify-between p-6 flex-1">
                  <div>
                    <h3 className="text-lg font-bold text-[#262726] mb-2">{bestProperty.name}</h3>
                    <p className="text-xs text-[#808080] mb-2">Best Apartments</p>
                  </div>
                  <div className="flex flex-row gap-6 mt-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-[#808080]">Total Sales</span>
                      <span className="text-lg font-bold text-[#262726]">{bestProperty.totalSales}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-[#808080]">Total Visits</span>
                      <span className="text-lg font-bold text-[#262726]">{bestProperty.totalVisits}</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Average Sale Value Bar Chart */}
              <div className="flex-1 bg-white rounded-2xl border border-[#262726] p-6 flex flex-col gap-2">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-semibold text-[#262726]">Average Sale Value</h3>
                  <span className="text-xs text-[#808080]">This month</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl font-bold text-[#262726]">${kpis && typeof kpis.avgDealSize === 'number' ? kpis.avgDealSize.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : '873,421.39'}</span>
                  <span className="text-xs text-[#808080]">$125,458.24 more than last month</span>
                </div>
                <div className="flex flex-row items-end gap-1 h-28 w-full">
                  {barData.map((val, i) => (
                    <div key={i} className={`rounded-t-lg ${i === barData.length - 1 ? 'bg-[#DAFC08]' : 'bg-[#808080]/60'} ${i === barData.length - 1 ? 'border border-[#262726]' : ''}`} style={{ height: `${(val / maxBar) * 100}%`, width: 12 }} />
                  ))}
                </div>
                <div className="flex flex-row justify-between text-xs text-[#808080] mt-1">
                  {barData.map((_, i) => <span key={i}>{i + 1}</span>)}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Bottom Table: Properties */}
        <div className="bg-white border border-[#262726] rounded-2xl p-6 m-10 mt-4">
          <div className="flex flex-row gap-4 mb-4">
            <input className="flex-1 rounded-xl border border-[#808080]/30 px-4 py-2 text-sm" placeholder="Search" />
            <select className="rounded-xl border border-[#808080]/30 px-4 py-2 text-sm">
              <option>District</option>
            </select>
            <select className="rounded-xl border border-[#808080]/30 px-4 py-2 text-sm">
              <option>Property type</option>
            </select>
            <select className="rounded-xl border border-[#808080]/30 px-4 py-2 text-sm">
              <option>Status</option>
            </select>
            <select className="rounded-xl border border-[#808080]/30 px-4 py-2 text-sm">
              <option>Cost</option>
            </select>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs text-[#808080]">
                <th className="py-2">Property</th>
                <th>Property type</th>
                <th>Agent</th>
                <th>Cost</th>
                <th>Views</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-[#808080]/20">
                <td className="py-2 flex items-center gap-2">
                  <img src={bestProperty.image} alt="property" className="w-10 h-10 rounded-lg object-cover" />
                  <div>
                    <div className="font-semibold text-[#262726]">{bestProperty.name}</div>
                    <div className="text-xs text-[#808080]">{bestProperty.address}</div>
                  </div>
                </td>
                <td>{bestProperty.type}</td>
                <td>{bestProperty.agent}</td>
                <td>${bestProperty.cost.toLocaleString()}</td>
                <td>{bestProperty.views}</td>
                <td><span className="bg-[#DAFC08] text-[#262726] px-3 py-1 rounded-full text-xs font-semibold">{bestProperty.status}</span></td>
                <td><Button size="sm" className="bg-[#262726] text-white rounded-full px-4 py-1">View</Button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPro; 