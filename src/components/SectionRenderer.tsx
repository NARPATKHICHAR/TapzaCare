import React, { useEffect, useRef } from "react";
import {
  Alert,
  Animated,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import type { LayoutSection, Doctor } from "../types";
import type { AppTheme } from "../theme";

type Props = {
  section: LayoutSection;
  theme: AppTheme;
  doctors: Doctor[];
  onBookDoctor: (doctor: Doctor) => void;
  onNavigate: (screen: "bookings" | "prescriptions" | "profile") => void;
  onSelectService: (serviceName: string) => void;
};

function BackgroundLayer({ section }: { section: LayoutSection }) {
  if (section.background.kind === "gradient") {
    const colors = section.background.value
      .split(",")
      .map((color) => color.trim())
      .filter(Boolean);
    return (
      <LinearGradient
        // pointerEvents="none"
        colors={
          colors.length >= 2
            ? colors
            : [colors[0] ?? "#0F766E", colors[0] ?? "#0F766E"]
        }
        style={StyleSheet.absoluteFillObject}
      />
    );
  }
  if (section.background.kind === "image" && section.background.value.trim()) {
    return (
      <ImageBackground
        source={{ uri: section.background.value }}
        resizeMode="cover"
        style={StyleSheet.absoluteFillObject}
      />
    );
  }
  return null;
}

const knownTypes = new Set([
  "hero_banner",
  "category_chips",
  "quick_actions",
  "service_grid",
  "doctor_carousel",
  "offer_strip",
]);

function getItems(section: LayoutSection): Record<string, unknown>[] {
  return section.items.filter(
    (item): item is Record<string, unknown> =>
      !!item && typeof item === "object" && !Array.isArray(item),
  );
}

export default function SectionRenderer({
  section,
  theme,
  doctors,
  onBookDoctor,
  onNavigate,
  onSelectService,
}: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY]);

  if (!knownTypes.has(section.type)) return null;

  const background = section.background.value;
  const isGradient = section.background.kind === "gradient";
  const colors = background.split(",");
  const containerStyle = {
    backgroundColor:
      section.background.kind === "color" ? background : "transparent",
    overflow: "hidden" as const,
  };

  const renderItems = getItems(section);
  const titleColor =
    section.type === "hero_banner" ? "#FFFFFF" : theme.colors.textPrimary;

  if (section.type === "hero_banner") {
    const item = renderItems[0] ?? {};
    return (
      <Animated.View
        style={[
          styles.hero,
          containerStyle,
          { opacity, transform: [{ translateY }] },
        ]}
      >
        <BackgroundLayer section={section} />
        <Text style={styles.heroGreeting}>
          {String(item.greeting ?? theme.festival.greeting)}
        </Text>
        <Text style={styles.heroTitle}>{section.title}</Text>
        <Text style={styles.heroSubtitle}>
          {String(item.subtitle ?? "Care for you and your family")}
        </Text>
        <View style={styles.heroPill}>
          <Text style={styles.heroPillText}>● Trusted family care</Text>
        </View>
      </Animated.View>
    );
  }

  if (section.type === "category_chips") {
    return (
      <Animated.View
        style={[
          styles.band,
          containerStyle,
          { opacity, transform: [{ translateY }] },
        ]}
      >
        <BackgroundLayer section={section} />
        <Text style={[styles.sectionTitle, { color: titleColor }]}>
          {section.title}
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontal}
        >
          {renderItems.map((item) => (
            <Pressable
              key={String(item.id)}
              onPress={() => onSelectService(String(item.name ?? "Consultation"))}
              accessibilityRole="button"
              accessibilityLabel={`Browse ${String(item.name ?? "service")}`}
              style={[
                styles.chip,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Text style={styles.itemIcon}>{String(item.icon ?? "•")}</Text>
              <Text
                style={[styles.chipText, { color: theme.colors.textPrimary }]}
              >
                {String(item.name ?? "")}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </Animated.View>
    );
  }

  if (section.type === "quick_actions") {
    return (
      <Animated.View
        style={[
          styles.band,
          containerStyle,
          { opacity, transform: [{ translateY }] },
        ]}
      >
        <BackgroundLayer section={section} />
        <Text style={[styles.sectionTitle, { color: titleColor }]}>
          {section.title}
        </Text>
        <View style={styles.actionGrid}>
          {renderItems.map((item, index) => {
            const handlePress = () => {
              const label = String(item.name ?? "").toLowerCase();
              const id = String(item.id ?? "").toLowerCase();
              if (label.includes("book") || id.includes("book")) {
                onNavigate("bookings");
              } else if (
                label.includes("prescription") || label.includes("reminder") ||
                label.includes("medicine") || id.includes("prescription") ||
                id.includes("reminder") || id.includes("medicine")
              ) {
                onNavigate("prescriptions");
              } else if (label.includes("family") || id.includes("family")) {
                Alert.alert("Family care", "Family care features are not included in this assignment slice yet.");
              }
            };

            return (
              <Pressable
                key={String(item.id)}
                onPress={handlePress}
                accessibilityRole="button"
                accessibilityLabel={String(item.name ?? "")}
                style={[
                  styles.action,
                  {
                    color: theme.colors.textPrimary,
                    backgroundColor: theme.colors.background,
                  },
                ]}
              >
                <Text style={styles.actionIcon}>
                  {String(item.icon ?? "•")}
                  {"\n"}
                </Text>
                <Text
                  style={{ color: theme.colors.textPrimary, fontWeight: "700" }}
                >
                  {String(item.name ?? "")}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Animated.View>
    );
  }

  
if (section.type === "service_grid") {
  return (
    <Animated.View
      style={[
        styles.band,
        containerStyle,
        { opacity, transform: [{ translateY }] },
      ]}
    >
      <BackgroundLayer section={section} />

      <Text style={[styles.sectionTitle, { color: titleColor }]}>
        {section.title}
      </Text>

      <View style={styles.serviceGrid}>
        {renderItems.map((item) => (
          <Pressable
            key={String(item.id)}
            onPress={() => onSelectService(String(item.name ?? "Clinic service"))}
            accessibilityRole="button"
            accessibilityLabel={`Book ${String(item.name ?? "service")}`}
            style={[
              styles.serviceCard,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Text style={styles.serviceIcon}>
              {String(item.icon ?? "✚")}
            </Text>

            {!!item.badge && (
              <Text
                style={[
                  styles.badge,
                  {
                    backgroundColor: theme.colors.secondary,
                    color: theme.colors.primary,
                  },
                ]}
              >
                {String(item.badge)}
              </Text>
            )}

            <Text
              style={[
                styles.cardTitle,
                { color: theme.colors.textPrimary },
              ]}
            >
              {String(item.name ?? "")}
            </Text>

            <Text style={[styles.price, { color: theme.colors.primary }]}>
              ₹{Number(item.price ?? 0)}
            </Text>
          </Pressable>
        ))}
      </View>
    </Animated.View>
  );
}


  if (section.type === "doctor_carousel") {
    const list = doctors.length ? doctors : [];
    return (
      <Animated.View
        style={[
          styles.band,
          containerStyle,
          { opacity, transform: [{ translateY }] },
        ]}
      >
        <BackgroundLayer section={section} />
        <Text style={[styles.sectionTitle, { color: titleColor }]}>
          {section.title}
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontal}
        >
          {list.map((doctor) => (
            <View
              key={doctor.id}
              style={[
                styles.doctorCard,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: theme.colors.secondary },
                ]}
              >
                <Text style={styles.avatarText}>
                  {doctor.name.replace("Dr. ", "").slice(0, 1)}
                </Text>
              </View>
              <Text
                style={[styles.cardTitle, { color: theme.colors.textPrimary }]}
              >
                {doctor.name}
              </Text>
              <Text
                style={[
                  styles.smallText,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {doctor.specialty}
              </Text>
              <Text style={[styles.price, { color: theme.colors.primary }]}>
                ₹{doctor.feeInr}
              </Text>
              <Pressable
                onPress={() => onBookDoctor(doctor)}
                accessibilityRole="button"
                accessibilityLabel={`Book visit with ${doctor.name}`}
                style={[
                  styles.bookButton,
                  { backgroundColor: theme.colors.primary },
                ]}
              >
                <Text style={styles.bookButtonText}>Book visit</Text>
              </Pressable>
            </View>
          ))}
        </ScrollView>
      </Animated.View>
    );
  }

  if (section.type === "offer_strip") {
    const message = renderItems[0]?.message ?? section.title;
    return (
      <Animated.View
        style={[
          styles.offer,
          containerStyle,
          { opacity, transform: [{ translateY }] },
        ]}
      >
        <BackgroundLayer section={section} />
        <Text style={[styles.offerText, { color: theme.colors.textPrimary }]}>
          ✦ {String(message)}
        </Text>
      </Animated.View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 26,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    minHeight: 180,
  },
  heroGreeting: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 27,
    fontWeight: "800",
    marginTop: 14,
    maxWidth: 310,
  },
  heroSubtitle: { color: "#E1F8F3", fontSize: 15, marginTop: 8 },
  heroPill: {
    alignSelf: "flex-start",
    marginTop: 16,
    backgroundColor: "#FFFFFF22",
    borderRadius: 99,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  heroPillText: { color: "#FFFFFF", fontSize: 12 },
  band: { paddingHorizontal: 18, paddingVertical: 20 },
  sectionTitle: { fontSize: 19, fontWeight: "800", marginBottom: 14 },
  horizontal: { gap: 10, paddingBottom: 3 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderRadius: 99,
  },
  chipText: { fontSize: 14, fontWeight: "600" },
  itemIcon: { fontSize: 17 },
  actionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  action: {
    width: "48%",
    minHeight: 90,
    textAlignVertical: "center",
    textAlign: "center",
    borderRadius: 16,
    paddingVertical: 13,
    overflow: "hidden",
    fontSize: 14,
    fontWeight: "700",
  },
  actionIcon: { fontSize: 24, lineHeight: 34 },
  serviceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
  serviceCard: {
    width: "48%",
    minHeight: 132,
    borderRadius: 18,
    padding: 14,
    elevation: 1,
  },
  serviceIcon: { fontSize: 27, marginBottom: 9 },
  badge: {
    position: "absolute",
    top: 10,
    right: 9,
    borderRadius: 99,
    paddingHorizontal: 7,
    paddingVertical: 4,
    fontSize: 10,
    overflow: "hidden",
  },
  cardTitle: { fontSize: 14, fontWeight: "700", marginTop: 5 },
  price: { fontSize: 15, fontWeight: "800", marginTop: 7 },
  doctorCard: { width: 190, borderRadius: 18, padding: 15, elevation: 1 },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 20, fontWeight: "800", color: "#075E57" },
  smallText: { fontSize: 12, marginTop: 5 },
  bookButton: {
    overflow: "hidden",
    borderRadius: 10,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginTop: 12,
  },
  bookButtonText: { color: "#FFFFFF", fontWeight: "700", textAlign: "center" },
  offer: { paddingHorizontal: 18, paddingVertical: 14 },
  offerText: { fontSize: 14, fontWeight: "700" },
});
