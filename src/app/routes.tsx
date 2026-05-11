import { createHashRouter } from "react-router";
import TripDashboard from "./components/TripDashboard";
import PlanningPhase from "./components/PlanningPhase";
import MoneyScreen from "./components/MoneyScreen";
import TripList from "./components/TripList";
import Timeline from "./components/Timeline";
import TripLayout from "./components/TripLayout";
import TripSettings from "./components/TripSettings";

export const router = createHashRouter([
  {
    path: "/",
    Component: TripList,
  },
  {
    path: "/trip/:tripId",
    Component: TripLayout,
    children: [
      { index: true, Component: TripDashboard },
      { path: "timeline", Component: Timeline },
      { path: "money", Component: MoneyScreen },
      { path: "planning", Component: PlanningPhase },
      { path: "settings", Component: TripSettings },
    ],
  },
]);