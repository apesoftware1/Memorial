"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Eye, 
  MessageSquare, 
  Heart, 
  Building, 
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Target,
  DollarSign,
  MapPin,
  Clock,
  Star,
  Shield,
  Lock
} from 'lucide-react';

// Admin email addresses that should have access to the dashboard
const ADMIN_EMAILS = [
  'regan@tombstonesfinder.com',
  'admin@tombstonesfinder.com',
  // Add any other admin emails here
];

export default function ReganDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is authorized (only Regan should have access)
  const isAuthorized = session?.user?.isAdmin || 
                      (session?.user?.email && ADMIN_EMAILS.includes(session.user.email.toLowerCase()));

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/manufacturers/login-page');
      return;
    }

    if (!isAuthorized) {
      router.push('/');
      return;
    }
  }, [session, status, isAuthorized, router]);

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show unauthorized message
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-4 text-center">
          <div className="mb-4">
            <Lock className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <Shield className="h-12 w-12 text-gray-400 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            This dashboard is restricted to website administrators only.
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  // Mock data - replace with actual API calls
  const dashboardData = {
    overview: {
      totalListings: 1247,
      totalManufacturers: 89,
      totalInquiries: 2341,
      totalVisits: 45678,
      totalFavorites: 1234,
      activeUsers: 567
    },
    trends: {
      listingsGrowth: 12.5,
      inquiriesGrowth: 8.3,
      visitsGrowth: 15.2,
      manufacturersGrowth: 5.7
    },
    topListings: [
      { id: 1, title: "Classic Marble Headstone", manufacturer: "Swiss Stone", visits: 1234, inquiries: 45, conversion: 3.6 },
      { id: 2, title: "Modern Granite Memorial", manufacturer: "Stone Craft", visits: 987, inquiries: 32, conversion: 3.2 },
      { id: 3, title: "Traditional Cross Design", manufacturer: "Heritage Stone", visits: 876, inquiries: 28, conversion: 3.2 },
      { id: 4, title: "Contemporary Glass Panel", manufacturer: "Modern Memorials", visits: 765, inquiries: 25, conversion: 3.3 },
      { id: 5, title: "Victorian Style Monument", manufacturer: "Classic Stone", visits: 654, inquiries: 22, conversion: 3.4 }
    ],
    topManufacturers: [
      { id: 1, name: "Swiss Stone", listings: 45, inquiries: 234, avgResponse: "2.3h", rating: 4.8 },
      { id: 2, name: "Stone Craft", listings: 38, inquiries: 198, avgResponse: "3.1h", rating: 4.6 },
      { id: 3, name: "Heritage Stone", listings: 32, inquiries: 167, avgResponse: "2.8h", rating: 4.7 },
      { id: 4, name: "Modern Memorials", listings: 28, inquiries: 145, avgResponse: "4.2h", rating: 4.5 },
      { id: 5, name: "Classic Stone", listings: 25, inquiries: 123, avgResponse: "3.5h", rating: 4.4 }
    ],
    recentActivity: [
      { id: 1, type: "inquiry", message: "New inquiry for Classic Marble Headstone", time: "2 minutes ago", manufacturer: "Swiss Stone" },
      { id: 2, type: "listing", message: "New listing added: Modern Glass Memorial", time: "15 minutes ago", manufacturer: "Modern Memorials" },
      { id: 3, type: "manufacturer", message: "New manufacturer registered: Stone Solutions", time: "1 hour ago" },
      { id: 4, type: "favorite", message: "Listing favorited: Traditional Cross Design", time: "2 hours ago" },
      { id: 5, type: "inquiry", message: "Inquiry responded to by Heritage Stone", time: "3 hours ago" }
    ],
    geographicData: [
      { province: "Gauteng", listings: 456, inquiries: 789, visits: 12345 },
      { province: "Western Cape", listings: 234, inquiries: 456, visits: 8765 },
      { province: "KwaZulu-Natal", listings: 198, inquiries: 345, visits: 6543 },
      { province: "Eastern Cape", listings: 156, inquiries: 234, visits: 4321 },
      { province: "Free State", listings: 123, inquiries: 189, visits: 3456 }
    ]
  };

  const MetricCard = ({ title, value, change, icon: Icon, color = "blue" }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value.toLocaleString()}</p>
          <div className="flex items-center mt-2">
            {change >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? '+' : ''}{change}%
            </span>
            <span className="text-sm text-gray-500 ml-1">vs last period</span>
          </div>
        </div>
        <div className={`p-3 rounded-lg bg-${color}-100`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  const ActivityItem = ({ activity }) => {
    const getIcon = (type) => {
      switch (type) {
        case 'inquiry': return <MessageSquare className="h-4 w-4 text-blue-500" />;
        case 'listing': return <Building className="h-4 w-4 text-green-500" />;
        case 'manufacturer': return <Users className="h-4 w-4 text-purple-500" />;
        case 'favorite': return <Heart className="h-4 w-4 text-red-500" />;
        default: return <Activity className="h-4 w-4 text-gray-500" />;
      }
    };

    return (
      <div className="flex items-center space-x-3 py-3 border-b border-gray-100 last:border-b-0">
        <div className="flex-shrink-0">
          {getIcon(activity.type)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">{activity.message}</p>
          <p className="text-xs text-gray-500">{activity.time}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Regan Dashboard</h1>
              <p className="text-gray-600 mt-1">Website analytics and performance metrics</p>
              <p className="text-sm text-blue-600 mt-1">Welcome, {session?.user?.name || 'Administrator'}</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                Export Report
              </button>
              <button 
                onClick={() => router.push('/')}
                className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
              >
                Back to Site
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <MetricCard
            title="Total Listings"
            value={dashboardData.overview.totalListings}
            change={dashboardData.trends.listingsGrowth}
            icon={Building}
            color="blue"
          />
          <MetricCard
            title="Total Visits"
            value={dashboardData.overview.totalVisits}
            change={dashboardData.trends.visitsGrowth}
            icon={Eye}
            color="green"
          />
          <MetricCard
            title="Total Inquiries"
            value={dashboardData.overview.totalInquiries}
            change={dashboardData.trends.inquiriesGrowth}
            icon={MessageSquare}
            color="purple"
          />
          <MetricCard
            title="Active Manufacturers"
            value={dashboardData.overview.totalManufacturers}
            change={dashboardData.trends.manufacturersGrowth}
            icon={Users}
            color="indigo"
          />
          <MetricCard
            title="Total Favorites"
            value={dashboardData.overview.totalFavorites}
            change={12.8}
            icon={Heart}
            color="red"
          />
          <MetricCard
            title="Active Users"
            value={dashboardData.overview.activeUsers}
            change={18.5}
            icon={Target}
            color="yellow"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Top Performing Listings */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Top Performing Listings</h3>
                <p className="text-sm text-gray-600 mt-1">Listings with highest engagement</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Listing</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manufacturer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visits</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inquiries</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversion</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dashboardData.topListings.map((listing) => (
                      <tr key={listing.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{listing.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{listing.manufacturer}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{listing.visits.toLocaleString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{listing.inquiries}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{listing.conversion}%</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                <p className="text-sm text-gray-600 mt-1">Latest website activity</p>
              </div>
              <div className="p-6">
                <div className="space-y-1">
                  {dashboardData.recentActivity.map((activity) => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Top Manufacturers */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Top Manufacturers</h3>
              <p className="text-sm text-gray-600 mt-1">Manufacturers with highest performance</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manufacturer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Listings</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inquiries</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Response</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dashboardData.topManufacturers.map((manufacturer) => (
                    <tr key={manufacturer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{manufacturer.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{manufacturer.listings}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{manufacturer.inquiries}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{manufacturer.avgResponse}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 mr-1" />
                          <span className="text-sm text-gray-900">{manufacturer.rating}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Geographic Distribution */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Geographic Distribution</h3>
              <p className="text-sm text-gray-600 mt-1">Activity by province</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {dashboardData.geographicData.map((region) => (
                  <div key={region.province} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{region.province}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{region.listings}</div>
                        <div className="text-xs text-gray-500">Listings</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{region.inquiries}</div>
                        <div className="text-xs text-gray-500">Inquiries</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{region.visits.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">Visits</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Traffic Overview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Traffic Overview</h3>
              <p className="text-sm text-gray-600 mt-1">Website traffic trends</p>
            </div>
            <div className="p-6">
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Chart visualization would go here</p>
                  <p className="text-xs text-gray-400">Integration with chart library needed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Inquiry Distribution */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Inquiry Distribution</h3>
              <p className="text-sm text-gray-600 mt-1">Inquiries by category</p>
            </div>
            <div className="p-6">
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Chart visualization would go here</p>
                  <p className="text-xs text-gray-400">Integration with chart library needed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}