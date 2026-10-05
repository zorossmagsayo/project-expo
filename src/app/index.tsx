import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { Href, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Sales = {
  total_meals: number;
  total_orders: number;
  total_sales: number;
  pending_orders: number;
};

const API_URL = "http://localhost:8000/api/sales";

type NavItem = {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  tint: string;
  route: Href;
};

// Make sure each route matches a file in your app folder (e.g. app/meals.tsx).
const NAV_ITEMS: NavItem[] = [
  {
    title: "Orders",
    subtitle: "Track & manage",
    icon: "receipt-outline",
    color: "#0891B2",
    tint: "#CFFAFE",
    route: "/orders",
  },
  {
    title: "Meals",
    subtitle: "Menu & prices",
    icon: "restaurant-outline",
    color: "#EA580C",
    tint: "#FFEDD5",
    route: "/meals",
  },
  {
    title: "Categories",
    subtitle: "Browse groups",
    icon: "grid-outline",
    color: "#4F46E5",
    tint: "#E0E7FF",
    route: "/categories",
  },
  {
    title: "Announcements",
    subtitle: "Latest updates",
    icon: "megaphone-outline",
    color: "#DB2777",
    tint: "#FCE7F3",
    route: "/announcements",
  },
  {
    title: "Vendors",
    subtitle: "Stalls & status",
    icon: "storefront-outline",
    color: "#059669",
    tint: "#D1FAE5",
    route: "/vendors",
  },
];

const formatNumber = (value?: number) =>
  value === undefined ? "—" : value.toLocaleString("en-PH");

const formatPeso = (value?: number) =>
  value === undefined
    ? "—"
    : `₱${value.toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;

type StatCardProps = {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  tint: string;
};

function StatCard({ label, value, icon, color, tint }: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.iconWrap, { backgroundColor: tint }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function NavTile({ item, onPress }: { item: NavItem; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={styles.navTile}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`Open ${item.title}`}>
      <View style={styles.navTop}>
        <View style={[styles.iconWrap, { backgroundColor: item.tint }]}>
          <Ionicons name={item.icon} size={22} color={item.color} />
        </View>
        <Ionicons name="arrow-forward" size={18} color="#9CA3AF" />
      </View>
      <Text style={styles.navTitle}>{item.title}</Text>
      <Text style={styles.navSubtitle}>{item.subtitle}</Text>
    </TouchableOpacity>
  );
}

export default function Index() {
  const router = useRouter();

  const [sales, setSales] = useState<Sales | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSales = useCallback(async () => {
    try {
      setError(null);

      const response = await axios.get<Sales>(API_URL);

      setSales(response.data);
    } catch (error) {
      console.log("Error:", error);
      setError(
        "We couldn't load your sales. Check your connection and try again.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    getSales();
  }, [getSales]);

  const onRefresh = () => {
    setRefreshing(true);
    getSales();
  };

  const onRetry = () => {
    setLoading(true);
    getSales();
  };

  // Initial loading state
  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, styles.center]}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.mutedText}>Loading dashboard…</Text>
      </SafeAreaView>
    );
  }

  // Error state (no data to show)
  if (error && !sales) {
    return (
      <SafeAreaView style={[styles.safe, styles.center]}>
        <View style={styles.errorIcon}>
          <Ionicons name="cloud-offline-outline" size={36} color="#DC2626" />
        </View>
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={[styles.mutedText, styles.errorText]}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={onRetry}
          activeOpacity={0.8}>
          <Ionicons name="refresh" size={18} color="#fff" />
          <Text style={styles.retryText}>Try again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F5F9" />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#4F46E5"
            colors={["#4F46E5"]}
          />
        }>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.subtitle}>Overview</Text>
          <Text style={styles.title}>Sales Dashboard</Text>
        </View>

        {/* Inline error when a refresh fails but old data is still shown */}
        {error && (
          <View style={styles.banner}>
            <Ionicons name="alert-circle" size={18} color="#B45309" />
            <Text style={styles.bannerText}>{error}</Text>
          </View>
        )}

        {/* Hero card */}
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <Text style={styles.heroLabel}>Total Sales</Text>
            <View style={styles.heroIcon}>
              <Ionicons name="cash-outline" size={20} color="#fff" />
            </View>
          </View>
          <Text style={styles.heroValue} numberOfLines={1} adjustsFontSizeToFit>
            {formatPeso(sales?.total_sales)}
          </Text>
          <Text style={styles.heroHint}>Pull down to refresh</Text>
        </View>

        {/* Stat grid */}
        <View style={styles.grid}>
          <StatCard
            label="Total Meals"
            value={formatNumber(sales?.total_meals)}
            icon="restaurant-outline"
            color="#EA580C"
            tint="#FFEDD5"
          />
          <StatCard
            label="Total Orders"
            value={formatNumber(sales?.total_orders)}
            icon="receipt-outline"
            color="#059669"
            tint="#D1FAE5"
          />
        </View>

        {/* Pending orders */}
        <View style={styles.pendingCard}>
          <View style={[styles.iconWrap, { backgroundColor: "#FEF3C7" }]}>
            <Ionicons name="time-outline" size={22} color="#D97706" />
          </View>
          <View style={styles.pendingInfo}>
            <Text style={styles.statLabel}>Pending Orders</Text>
            <Text style={styles.pendingValue}>
              {formatNumber(sales?.pending_orders)}
            </Text>
          </View>
          {!!sales?.pending_orders && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Needs attention</Text>
            </View>
          )}
        </View>

        {/* Quick access navigation */}
        <Text style={styles.sectionTitle}>Quick access</Text>
        <View style={styles.navGrid}>
          {NAV_ITEMS.map((item) => (
            <NavTile
              key={item.title}
              item={item}
              onPress={() => router.push(item.route)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const shadow = Platform.select({
  ios: {
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },
  default: { elevation: 3 },
});

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F4F5F9",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },

  // Header
  header: {
    marginBottom: 20,
    marginTop: 8,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#111827",
    marginTop: 2,
  },

  // Hero
  hero: {
    backgroundColor: "#4F46E5",
    borderRadius: 20,
    padding: 22,
    marginBottom: 16,
    ...shadow,
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#C7D2FE",
  },
  heroIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroValue: {
    fontSize: 38,
    fontWeight: "800",
    color: "#fff",
    marginTop: 14,
  },
  heroHint: {
    fontSize: 12,
    color: "#A5B4FC",
    marginTop: 8,
  },

  // Grid
  grid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    ...shadow,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111827",
    marginTop: 14,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    marginTop: 2,
  },

  // Pending
  pendingCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    ...shadow,
  },
  pendingInfo: {
    flex: 1,
    marginLeft: 14,
  },
  pendingValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
  },
  badge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#B45309",
  },

  // Navigation
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginTop: 28,
    marginBottom: 14,
  },
  navGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  navTile: {
    flexBasis: "45%",
    flexGrow: 1,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    ...shadow,
  },
  navTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  navTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
    marginTop: 14,
  },
  navSubtitle: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
    marginTop: 2,
  },

  // States
  mutedText: {
    fontSize: 15,
    color: "#6B7280",
    marginTop: 12,
  },
  errorIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginTop: 8,
  },
  errorText: {
    textAlign: "center",
    maxWidth: 300,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#4F46E5",
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
  },
  retryText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF3C7",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  bannerText: {
    flex: 1,
    fontSize: 13,
    color: "#92400E",
  },
});
