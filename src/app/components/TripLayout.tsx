import type React from "react";
import { Outlet, useParams, useLocation, Link } from "react-router";
import { Home, Clock, Wallet } from "lucide-react";
import { motion } from "motion/react";
import { TripDataProvider, useTripData } from "./TripDataContext";
import { PullToRefresh } from "./PullToRefresh";

const tabs = [
  { path: "", label: "Overview", icon: Home },
  { path: "/timeline", label: "Timeline", icon: Clock },
  { path: "/money", label: "Money", icon: Wallet },
];

export default function TripLayout() {
  const { tripId } = useParams();
  const location = useLocation();
  const basePath = `/trip/${tripId}`;

  const currentTab = tabs.findIndex((tab) => {
    const fullPath = basePath + tab.path;
    if (tab.path === "") {
      return location.pathname === basePath || location.pathname === basePath + "/";
    }
    return location.pathname.startsWith(fullPath);
  });

  // Don't show tab bar on planning page (it's a subflow)
  const isSubflow = location.pathname.includes("/planning") || location.pathname.includes("/settings");

  return (
    <TripDataProvider tripId={tripId || ""}>
      <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col bg-[#F7F7F5]">
        <TripScrollRegion isSubflow={isSubflow}>
          <Outlet />
        </TripScrollRegion>

        {/* Bottom Tab Bar — flex footer so it stays at the bottom of the mockup screen */}
        {!isSubflow && (
          <nav className="relative z-50 w-full shrink-0 border-t border-black/[0.04] bg-white/80 backdrop-blur-xl">
            <div className="flex w-full items-stretch justify-around px-2 pb-[max(8px,env(safe-area-inset-bottom,0px))] pt-1.5">
              {tabs.map((tab, index) => {
                const isActive = currentTab === index;
                const Icon = tab.icon;
                const fullPath = basePath + tab.path;

                return (
                  <Link
                    key={tab.path}
                    to={fullPath}
                    className="flex flex-col items-center justify-center gap-0.5 py-1.5 px-3 min-w-[64px] relative"
                  >
                    <div className="relative">
                      <Icon
                        className={`size-[22px] transition-colors duration-200 ${
                          isActive ? "text-[#007AFF]" : "text-[#8E8E93]"
                        }`}
                        strokeWidth={isActive ? 2.2 : 1.8}
                      />
                      {isActive && (
                        <motion.div
                          layoutId="tab-indicator"
                          className="absolute -inset-2 bg-[#007AFF]/[0.08] rounded-xl -z-10"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                    </div>
                    <span
                      className={`text-[10px] transition-colors duration-200 ${
                        isActive
                          ? "text-[#007AFF] font-semibold"
                          : "text-[#8E8E93] font-medium"
                      }`}
                    >
                      {tab.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </div>
    </TripDataProvider>
  );
}

// Pulls the trip context so it can drive pull-to-refresh. Disabled on
// subflows like /planning where the sheets have their own gestures and the
// content is typically static during an editing session.
function TripScrollRegion({
  isSubflow,
  children,
}: {
  isSubflow: boolean;
  children: React.ReactNode;
}) {
  const location = useLocation();
  const { refetch } = useTripData();
  // Timeline relies heavily on drag-based sheets/trays; disabling pull-to-refresh
  // here prevents gesture conflicts that can look like a background refresh.
  const disablePullToRefresh =
    isSubflow || location.pathname.includes("/timeline");
  return (
    <div className="min-h-0 flex-1 overflow-hidden">
      <PullToRefresh
        onRefresh={refetch}
        disabled={disablePullToRefresh}
        className="h-full"
      >
        {children}
      </PullToRefresh>
    </div>
  );
}