import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Platform,
    RefreshControl,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type Order = {
  id: number;
  meal_name: string;
  quantity: number;
  total_price: number;
  status: string;
};

// Note: "localhost" only works on iOS simulator / web.
// Android emulator -> http://10.0.2.2:8000 | Physical device -> your computer's LAN IP.
const API_URL = "http://localhost:8000/api/orders";

type StatusStyle = {
  color: string;
  tint: string;
  icon: keyof typeof Ionicons.glyphMap;
};

// Colors for common status values. Anything unknown falls back to gray.
const STATUS_STYLES: Record<string, StatusStyle> = {
  pending: { color: "#B45309", tint: "#FEF3C7", icon: "time-outline" },
  preparing: { color: "#4338CA", tint: "#E0E7FF", icon: "flame-outline" },
  ready: { color: "#0E7490", tint: "#CFFAFE", icon: "bag-check-outline" },
  completed: {
    color: "#047857",
    tint: "#D1FAE5",
    icon: "checkmark-circle-outline",
  },
  delivered: {
    color: "#047857",
    tint: "#D1FAE5",
    icon: "checkmark-circle-outline",
  },
  cancelled: {
    color: "#B91C1C",
    tint: "#FEE2E2",
    icon: "close-circle-outline",
  },
  canceled: { color: "#B91C1C", tint: "#FEE2E2", icon: "close-circle-outline" },
};

const DEFAULT_STATUS: StatusStyle = {
  color: "#4B5563",
  tint: "#F3F4F6",
  icon: "ellipse-outline",
};

const getStatusStyle = (status: string) =>
  STATUS_STYLES[status?.toLowerCase()] ?? DEFAULT_STATUS;

const formatStatus = (status: string) =>
  status
    ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
    : "Unknown";

const formatPeso = (value: number) =>
  `₱${value.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

function OrderCard({ item }: { item: Order }) {
  const status = getStatusStyle(item.status);

  return (
    <View style={styles.card}>
      {/* Top row: meal + status */}
      <View style={styles.cardTop}>
        <View style={styles.iconWrap}>
          <Ionicons name="receipt-outline" size={22} color="#4F46E5" />
        </View>

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {item.meal_name}
          </Text>
          <Text style={styles.orderId}>Order #{item.id}</Text>
        </View>

        <View style={[styles.badge, { backgroundColor: status.tint }]}>
          <Ionicons name={status.icon} size={14} color={status.color} />
          <Text style={[styles.badgeText, { color: status.color }]}>
            {formatStatus(item.status)}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Bottom row: quantity + total */}
      <View style={styles.cardBottom}>
        <View>
          <Text style={styles.metaLabel}>Quantity</Text>
          <Text style={styles.metaValue}>× {item.quantity}</Text>
        </View>

        <View style={styles.totalWrap}>
          <Text style={styles.metaLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatPeso(item.total_price)}</Text>
        </View>
      </View>
    </View>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getOrders = useCallback(async () => {
    try {
      setError(null);

      const response = await axios.get<Order[]>(API_URL);

      setOrders(response.data);
    } catch (error) {
      console.log("Error:", error);
      setError(
        "We couldn't load the orders. Check your connection and try again.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    getOrders();
  }, [getOrders]);

  const onRefresh = () => {
    setRefreshing(true);
    getOrders();
  };

  const onRetry = () => {
    setLoading(true);
    getOrders();
  };

  const pendingCount = orders.filter(
    (o) => o.status?.toLowerCase() === "pending",
  ).length;

  // Initial loading state
  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, styles.center]}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.mutedText}>Loading orders…</Text>
      </SafeAreaView>
    );
  }

  // Error state (no data to show)
  if (error && orders.length === 0) {
    return (
      <SafeAreaView style={[styles.safe, styles.center]}>
        <View style={styles.errorIcon}>
          <Ionicons name="cloud-offline-outline" size={36} color="#DC2626" />
        </View>
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={[styles.mutedText, styles.centerText]}>{error}</Text>
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

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <OrderCard item={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#4F46E5"
            colors={["#4F46E5"]}
          />
        }
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <Text style={styles.subtitle}>Activity</Text>
              <Text style={styles.title}>Orders</Text>
            </View>

            {/* Inline error when a refresh fails but old data is still shown */}
            {error && (
              <View style={styles.banner}>
                <Ionicons name="alert-circle" size={18} color="#B45309" />
                <Text style={styles.bannerText}>{error}</Text>
              </View>
            )}

            {orders.length > 0 && (
              <View style={styles.pills}>
                <View style={styles.summary}>
                  <Text style={styles.summaryText}>
                    {orders.length} {orders.length === 1 ? "order" : "orders"}
                  </Text>
                </View>
                {pendingCount > 0 && (
                  <View style={[styles.summary, styles.summaryPending]}>
                    <Text
                      style={[styles.summaryText, styles.summaryPendingText]}>
                      {pendingCount} pending
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="receipt-outline" size={36} color="#4F46E5" />
            </View>
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={[styles.mutedText, styles.centerText]}>
              New orders will show up here. Pull down to refresh.
            </Text>
          </View>
        }
      />
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
  centerText: {
    textAlign: "center",
    maxWidth: 300,
  },
  list: {
    padding: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },

  // Header
  header: {
    marginBottom: 16,
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
  pills: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  summary: {
    backgroundColor: "#E0E7FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  summaryText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4338CA",
  },
  summaryPending: {
    backgroundColor: "#FEF3C7",
  },
  summaryPendingText: {
    color: "#B45309",
  },

  // Card
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    ...shadow,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#E0E7FF",
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  name: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },
  orderId: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
    marginTop: 2,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 14,
  },
  cardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  totalWrap: {
    alignItems: "flex-end",
  },
  metaLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginTop: 3,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#4F46E5",
    marginTop: 3,
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
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#E0E7FF",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginTop: 16,
  },
});
