// presentation/pages/reception/Dashboard.jsx
import StatsCards from '../../components/reception/StatsCards';
import ReservationTabs from '../../components/reception/ReservationTabs';
import QuickActions from '../../components/reception/QuickActions';

const DashboardReception = () => {
  return (
    <div className="space-y-6">
      <StatsCards />
      <QuickActions />
    </div>
  );
};

export default DashboardReception;