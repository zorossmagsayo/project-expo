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

type Vendor = {
  id: number;
  stall_name: string;
  is_open: boolean;
};

// Note: "localhost" only works on iOS simulator / web.
// Android emulator -> http://10.0.2.2:8000 | Physical device -> your computer's LAN IP.
const API_URL = "http://localhost:8000/api/vendors";

function VendorCard({ item }: { item: Vendor }) {
  return (
    <View style={[styles.card, !item.is_open && styles.cardClosed]}>
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: item.is_open ? "#D1FAE5" : "#F3F4F6" },
        ]}>
        <Ionicons
          name="storefront-outline"
          size={22}
          color={item.is_open ? "#059669" : "#9CA3AF"}
        />
      </View>

      <Text
        style={[styles.name, !item.is_open && styles.mutedName]}
        numberOfLines={1}>
        {item.stall_name}
      </Text>

      <View
        style={[
          styles.badge,
          { backgroundColor: item.is_open ? "#D1FAE5" : "#FEE2E2" },
        ]}>
        <View
          style={[
            styles.dot,
            { backgroundColor: item.is_open ? "#059669" : "#DC2626" },
          ]}
        />
        <Text
          style={[
            styles.badgeText,
            { color: item.is_open ? "#047857" : "#B91C1C" },
          ]}>
          {item.is_open ? "Open" : "Closed"}
        </Text>
      </View>
    </View>
  );
}

export default function Vendors() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getVendors = useCallback(async () => {
    try {
      setError(null);

      const response = await axios.get<Vendor[]>(API_URL);

      setVendors(response.data);
    } catch (error) {
      console.log("Error:", error);
      setError(
        "We couldn't load the vendors. Check your connection and try again.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    getVendors();
  }, [getVendors]);

  const onRefresh = () => {
    setRefreshing(true);
    getVendors();
  };

  const onRetry = () => {
    setLoading(true);
    getVendors();
  };

  const openCount = vendors.filter((v) => v.is_open).length;

  // Initial loading state
  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, styles.center]}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.mutedText}>Loading vendors…</Text>
      </SafeAreaView>
    );
  }

  // Error state (no data to show)
  if (error && vendors.length === 0) {
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
        data={vendors}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <VendorCard item={item} />}
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
              <Text style={styles.subtitle}>Stalls</Text>
              <Text style={styles.title}>Vendors</Text>
            </View>

            {/* Inline error when a refresh fails but old data is still shown */}
            {error && (
              <View style={styles.banner}>
                <Ionicons name="alert-circle" size={18} color="#B45309" />
                <Text style={styles.bannerText}>{error}</Text>
              </View>
            )}

            {vendors.length > 0 && (
              <View style={styles.summary}>
                <Text style={styles.summaryText}>
                  {openCount} of {vendors.length} vendors open
                </Text>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="storefront-outline" size={36} color="#4F46E5" />
            </View>
            <Text style={styles.emptyTitle}>No vendors yet</Text>
            <Text style={[styles.mutedText, styles.centerText]}>
              Vendors you add will show up here. Pull down to refresh.
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
  summary: {
    alignSelf: "flex-start",
    backgroundColor: "#E0E7FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 16,
  },
  summaryText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4338CA",
  },

  // Card
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    ...shadow,
  },
  cardClosed: {
    opacity: 0.75,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    marginLeft: 14,
    marginRight: 8,
  },
  mutedName: {
    color: "#6B7280",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
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
