import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";

type IconName = keyof typeof Ionicons.glyphMap;

type TabConfig = {
  name: string; // must match the file name in the app folder
  title: string; // label shown under the icon
  icon: IconName;
  iconFocused: IconName;
  hidden?: boolean; // still a valid route, just not shown in the tab bar
};

const TABS: TabConfig[] = [
  {
    name: "index",
    title: "Home",
    icon: "home-outline",
    iconFocused: "home",
  },
  {
    name: "orders",
    title: "Orders",
    icon: "receipt-outline",
    iconFocused: "receipt",
  },
  {
    name: "meals",
    title: "Meals",
    icon: "restaurant-outline",
    iconFocused: "restaurant",
  },
  {
    name: "vendors",
    title: "Vendors",
    icon: "storefront-outline",
    iconFocused: "storefront",
  },
  {
    name: "announcements",
    title: "News",
    icon: "megaphone-outline",
    iconFocused: "megaphone",
  },
  {
    // Reachable from the Home "Quick access" tiles.
    // Remove `hidden: true` to show it as a sixth tab.
    name: "categories",
    title: "Categories",
    icon: "grid-outline",
    iconFocused: "grid",
    hidden: true,
  },
];

export default function RootLayout() {
  return (
    <Tabs
      screenOptions={{
        // Each screen already renders its own header (title + subtitle)
        headerShown: false,
        tabBarActiveTintColor: "#4F46E5",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          marginBottom: Platform.OS === "android" ? 6 : 0,
        },
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 0,
          height: Platform.OS === "ios" ? 88 : 66,
          paddingTop: 6,
          ...Platform.select({
            ios: {
              shadowColor: "#111827",
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.06,
              shadowRadius: 12,
            },
            default: { elevation: 12 },
          }),
        },
      }}>
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            // href: null removes the tab button but keeps the route
            ...(tab.hidden ? { href: null } : {}),
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? tab.iconFocused : tab.icon}
                size={size}
                color={color}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
