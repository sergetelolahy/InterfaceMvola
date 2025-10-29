// presentation/components/reception/StatsCards.jsx
import { FaCalendarDay, FaBed, FaUserCheck, FaUserTimes, FaArrowUp, FaClock, FaCheck } from 'react-icons/fa';

function StatsCards() {
  const stats = [
    {
      title: "Réservations du jour",
      value: "12",
      icon: <FaCalendarDay />,
      color: "blue",
      trend: { text: "3 nouvelles", type: "up" }
    },
    {
      title: "Chambres occupées",
      value: "24/42",
      icon: <FaBed />,
      color: "green",
      trend: { text: "57% d'occupation", type: "up" }
    },
    {
      title: "Arrivées aujourd'hui",
      value: "8",
      icon: <FaUserCheck />,
      color: "purple",
      trend: { text: "2 en attente", type: "pending" }
    },
    {
      title: "Départs aujourd'hui",
      value: "6",
      icon: <FaUserTimes />,
      color: "orange",
      trend: { text: "4 effectués", type: "neutral" }
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: { bg: 'bg-blue-100', text: 'text-blue-500' },
      green: { bg: 'bg-green-100', text: 'text-green-500' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-500' },
      orange: { bg: 'bg-orange-100', text: 'text-orange-500' }
    };
    return colors[color] || colors.blue;
  };

  const getTrendIcon = (type) => {
    switch (type) {
      case 'up': return <FaArrowUp className="mr-1" />;
      case 'pending': return <FaClock className="mr-1" />;
      case 'neutral': return <FaCheck className="mr-1" />;
      default: return <FaArrowUp className="mr-1" />;
    }
  };

  const getTrendColor = (type) => {
    switch (type) {
      case 'up': return 'text-green-500';
      case 'pending': return 'text-red-500';
      case 'neutral': return 'text-gray-500';
      default: return 'text-green-500';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      {stats.map((stat, index) => {
        const colorClasses = getColorClasses(stat.color);
        return (
          <div key={index} className="bg-white rounded-xl shadow p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500">{stat.title}</p>
                <h3 className="text-3xl font-bold mt-2">{stat.value}</h3>
              </div>
              <div className={`${colorClasses.bg} p-3 rounded-full`}>
                <div className={`${colorClasses.text} text-xl`}>
                  {stat.icon}
                </div>
              </div>
            </div>
            <div className={`mt-4 text-sm ${getTrendColor(stat.trend.type)} flex items-center`}>
              {getTrendIcon(stat.trend.type)}
              {stat.trend.text}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default StatsCards;