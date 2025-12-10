import React from "react";
import {
  ShoppingBagIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
  ClockIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

import {
  formatCrypto,
  formatNumber,
  formatDuration,
  formatCompactNumber,
} from "../services/formatters";

export default function StatsCards({
  totalOrders = 0,
  totalGMV = 0,
  platformRevenue = 0,
  avgDeliveryTime = 0,
  activeUsers = 0,
}) {
  const stats = [
    {
      label: "Total Commandes",
      value: formatCompactNumber(totalOrders),
      icon: <ShoppingBagIcon className="h-8 w-8 text-indigo-600" />,
      bg: "bg-indigo-50",
    },
    {
      label: "GMV Total",
      value: formatCrypto(totalGMV, "MATIC", 3),
      icon: <CurrencyDollarIcon className="h-8 w-8 text-green-600" />,
      bg: "bg-green-50",
    },
    {
      label: "Revenus Plateforme",
      value: formatCrypto(platformRevenue, "MATIC", 3),
      icon: <BanknotesIcon className="h-8 w-8 text-yellow-600" />,
      bg: "bg-yellow-50",
    },
    {
      label: "Temps Moyen Livraison",
      value: formatDuration(avgDeliveryTime),
      icon: <ClockIcon className="h-8 w-8 text-purple-600" />,
      bg: "bg-purple-50",
    },
    {
      label: "Utilisateurs Actifs",
      value: formatCompactNumber(activeUsers),
      icon: <UserGroupIcon className="h-8 w-8 text-blue-600" />,
      bg: "bg-blue-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
      {stats.map((item, index) => (
        <div
          key={index}
          className={`p-5 rounded-xl shadow-sm border flex flex-col gap-3 ${item.bg}`}
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-700">{item.label}</span>
            {item.icon}
          </div>

          <div className="text-2xl font-bold text-gray-900">
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
}
