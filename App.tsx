import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  PanResponder,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SectionRenderer from "./src/components/SectionRenderer";
import {
  getBookings,
  getConfig,
  getDoctors,
  getPrescriptions,
  getSlots,
  createBooking,
  mockSettings,
  setFestival,
} from "./src/api";
import { normalDayConfig, validateConfig } from "./src/config";
import { t, type Language } from "./src/i18n";
import { createTheme } from "./src/theme";
import type {
  Booking,
  Doctor,
  LayoutConfig,
  Prescription,
  Slot,
} from "./src/types";

const CACHE_KEY = "tapza.lastGoodConfig";

export default function App() {
  const [config, setConfig] = useState<LayoutConfig>(normalDayConfig);
  const [screen, setScreen] = useState<
    "home" | "bookings" | "prescriptions" | "profile"
  >("home");
  const [loading, setLoading] = useState(true);
  const [configError, setConfigError] = useState("");
  const [festival, setFestivalEnabled] = useState(false);
  const [language, setLanguage] = useState<Language>("en");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [doseTaken, setDoseTaken] = useState<Record<string, boolean>>({});
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState("2026-10-14");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [slotLoading, setSlotLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [expandedPrescription, setExpandedPrescription] = useState<
    string | null
  >(null);
  const [bookingError, setBookingError] = useState("");
  const [prescriptionError, setPrescriptionError] = useState("");
  const [headerCompact, setHeaderCompact] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const sheetY = useRef(new Animated.Value(450)).current;

  const theme = useMemo(() => createTheme(config.theme), [config]);
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const loadConfig = useCallback(async () => {
    setLoading(true);
    setConfigError("");
    try {
      const remote = await getConfig();
      if (!validateConfig(remote)) throw new Error("Invalid config response");
      setConfig(remote);
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(remote));
    } catch (error) {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const parsed: unknown = JSON.parse(cached);
          if (validateConfig(parsed)) setConfig(parsed);
          else throw new Error("Cached config invalid");
          setConfigError("Offline mode: showing your last saved home.");
        } catch {
          setConfigError("Could not load config. Showing the default home.");
        }
      } else {
        setConfig(normalDayConfig);
        setConfigError("Could not load config. Showing the default home.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCoreData = useCallback(async () => {
    try {
      const [doctorData, rxData, bookingData] = await Promise.all([
        getDoctors(),
        getPrescriptions(),
        getBookings(),
      ]);
      setDoctors(doctorData);
      setPrescriptions(rxData);
      setBookings(bookingData);
      setPrescriptionError("");
    } catch {
      setPrescriptionError(
        "Some information could not be refreshed. Check connection and retry.",
      );
    }
  }, []);

  useEffect(() => {
    loadConfig();
    loadCoreData();
  }, [loadConfig, loadCoreData]);

  const toggleFestival = async (enabled: boolean) => {
    setFestivalEnabled(enabled);
    const next = await setFestival(enabled);
    setConfig(next);
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(next));
  };

  const openBooking = async (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setSelectedSlot(null);
    setBookingError("");
    setScreen("bookings");
    setSlotLoading(true);
    try {
      const data = await getSlots(doctor.id, selectedDate);
      setSlots(data);
    } catch (error) {
      setBookingError(
        error instanceof Error ? error.message : "Could not load slots.",
      );
      setSlots([]);
    } finally {
      setSlotLoading(false);
    }
    sheetY.setValue(450);
    Animated.spring(sheetY, {
      toValue: 0,
      useNativeDriver: true,
      damping: 22,
    }).start();
  };

  const selectService = (serviceName: string) => {
    setSelectedService(serviceName);
    setSelectedDoctor(null);
    setSelectedSlot(null);
    setBookingError("");
    setScreen("bookings");
  };

  const openDoctorBooking = (doctor: Doctor) => {
    setSelectedService(null);
    void openBooking(doctor);
  };

  const changeDate = async (date: string) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    if (!selectedDoctor) return;
    setSlotLoading(true);
    try {
      setSlots(await getSlots(selectedDoctor.id, date));
      setBookingError("");
    } catch {
      setSlots([]);
      setBookingError("Unable to load slots. Check the network and retry.");
    } finally {
      setSlotLoading(false);
    }
  };

  const confirmBooking = async () => {
    if (!selectedDoctor || !selectedSlot || bookingLoading) return;
    setBookingLoading(true);
    setBookingError("");
    const optimistic: Booking = {
      id: `pending-${Date.now()}`,
      doctorId: selectedDoctor.id,
      slotId: selectedSlot.id,
      status: "confirmed",
    };
    setBookings((previous) => [optimistic, ...previous]);
    setSlots((previous) =>
      previous.map((slot) =>
        slot.id === selectedSlot.id ? { ...slot, available: false } : slot,
      ),
    );
    try {
      const saved = await createBooking(selectedDoctor.id, selectedSlot.id);
      setBookings((previous) =>
        previous.map((item) => (item.id === optimistic.id ? saved : item)),
      );
      setSelectedSlot(null);
      setSelectedDoctor(null);
      setScreen("bookings");
      Alert.alert(
        "Booking confirmed",
        "Your visit is booked. We look forward to seeing you.",
      );
    } catch (error) {
      setBookings((previous) =>
        previous.filter((item) => item.id !== optimistic.id),
      );
      setBookingError(
        error instanceof Error
          ? error.message
          : "Booking failed. Please try again.",
      );
      try {
        setSlots(await getSlots(selectedDoctor.id, selectedDate));
      } catch {
        // Keep the current list usable if reconciliation also fails.
      }
    } finally {
      setBookingLoading(false);
    }
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) => gesture.dy > 8,
        onPanResponderMove: (_, gesture) => {
          if (gesture.dy > 0) sheetY.setValue(gesture.dy);
        },
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dy > 120) {
            Animated.timing(sheetY, {
              toValue: 500,
              duration: 180,
              useNativeDriver: true,
            }).start(() => {
              setSelectedDoctor(null);
            });
          } else {
            Animated.spring(sheetY, {
              toValue: 0,
              useNativeDriver: true,
              damping: 22,
            }).start();
          }
        },
      }),
    [sheetY],
  );

  const refreshAll = async () => {
    await Promise.all([loadConfig(), loadCoreData()]);
  };

  const title =
    screen === "home"
      ? "Tapza Care"
      : screen === "bookings"
        ? t(language, "bookings")
        : screen === "prescriptions"
          ? t(language, "prescriptions")
          : t(language, "more");
  const availableDates = useMemo(() => {
    return Array.from({ length: 14 }, (_, index) => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() + index);

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      return {
        value: `${year}-${month}-${day}`,
        day: date.toLocaleDateString("en-IN", { weekday: "short" }),
        number: date.getDate(),
      };
    });
  }, []);
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar
        backgroundColor={theme.colors.primary}
        barStyle="light-content"
      />
      <View style={[styles.header, headerCompact && styles.headerCompact]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.brand}>{title}</Text>
          {screen === "home" && (
            <Text style={styles.headerSub}>{t(language, "hello")}</Text>
          )}
        </View>
        <View style={styles.languagePill}>
          <Text
            onPress={() => setLanguage(language === "en" ? "hi" : "en")}
            style={styles.languageText}
          >
            {language === "en" ? "हिंदी" : "EN"}
          </Text>
        </View>
      </View>

      {screen === "home" && (
        <Animated.ScrollView
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            {
              useNativeDriver: false,
              listener: (event: {
                nativeEvent: { contentOffset: { y: number } };
              }) => {
                setHeaderCompact(event.nativeEvent.contentOffset.y > 35);
              },
            },
          )}
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingBottom: 22 }}
        >
          {loading ? (
            <View style={styles.loadingBlock}>
              <ActivityIndicator color={theme.colors.primary} size="large" />
              <Text style={styles.bodyText}>{t(language, "loading")}</Text>
              {[1, 2, 3].map((i) => (
                <View key={i} style={styles.skeleton} />
              ))}
            </View>
          ) : (
            <>
              {!!configError && (
                <Pressable onPress={loadConfig} style={styles.notice}>
                  <Text style={styles.noticeText}>
                    {configError} · {t(language, "retry")}
                  </Text>
                </Pressable>
              )}
              {config.sections.map((section) => (
                <SectionRenderer
                  key={`${config.version}-${section.id}`}
                  section={section}
                  theme={theme}
                  doctors={doctors}
                  onBookDoctor={openDoctorBooking}
                  onNavigate={setScreen}
                  onSelectService={selectService}
                />
              ))}
            </>
          )}
        </Animated.ScrollView>
      )}

      {screen === "bookings" && (
        <ScrollView contentContainerStyle={styles.screenPad}>
          <Text style={styles.pageTitle}>Book a clinic visit</Text>
          {!!selectedService && (
            <View style={styles.listCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.muted}>Selected service</Text>
                <Text style={styles.cardTitle}>{selectedService}</Text>
              </View>
              <Pressable
                onPress={() => setSelectedService(null)}
                style={styles.outlineButton}
              >
                <Text style={styles.outlineText}>Change</Text>
              </Pressable>
            </View>
          )}
          {!selectedDoctor ? (
            <>
              <Text style={styles.bodyText}>
                {selectedService
                  ? `Choose a doctor for ${selectedService.toLowerCase()} to see available appointments.`
                  : "Choose a doctor to see available appointments."}
              </Text>
              {doctors.map((doctor) => (
                <Pressable
                  key={doctor.id}
                  onPress={() => openBooking(doctor)}
                  style={styles.listCard}
                >
                  <View style={styles.avatar}>
                    <Text
                      style={[
                        styles.avatarText,
                        { color: theme.colors.primary },
                      ]}
                    >
                      {doctor.name.slice(4, 5)}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{doctor.name}</Text>
                    <Text style={styles.muted}>
                      {doctor.specialty} · {doctor.languages.join(", ")}
                    </Text>
                    <Text style={styles.price}>
                      ₹{doctor.feeInr} consultation
                    </Text>
                  </View>
                  <Text style={styles.arrow}>›</Text>
                </Pressable>
              ))}
            </>
          ) : (
            <View style={styles.listCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{selectedDoctor.name}</Text>
                <Text style={styles.muted}>
                  {selectedDoctor.specialty} · ₹{selectedDoctor.feeInr}
                </Text>
              </View>
              <Pressable
                onPress={() => setSelectedDoctor(null)}
                style={styles.outlineButton}
              >
                <Text style={styles.outlineText}>Change</Text>
              </Pressable>
            </View>
          )}
          {selectedDoctor && (
            <>
              <Text style={styles.sectionHeading}>Choose a date</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8 }}
              >
                {availableDates.map((item) => {
                  const active = selectedDate === item.value;

                  return (
                    <Pressable
                      key={item.value}
                      onPress={() => changeDate(item.value)}
                      style={[styles.dateChip, active && styles.dateChipActive]}
                      accessibilityRole="button"
                      accessibilityLabel={`${item.day}, ${item.number}`}
                      accessibilityState={{ selected: active }}
                    >
                      <Text
                        style={[
                          styles.dateDay,
                          active && styles.dateTextActive,
                        ]}
                      >
                        {item.day}
                      </Text>

                      <Text
                        style={[
                          styles.dateNumber,
                          active && styles.dateTextActive,
                        ]}
                      >
                        {item.number}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
              <View style={styles.sheetHandle} {...panResponder.panHandlers}>
                <View style={styles.handleBar} />
                <Text style={styles.sectionHeading}>Available time slots</Text>
              </View>
              {slotLoading ? (
                <ActivityIndicator color={theme.colors.primary} />
              ) : slots.filter((s) => s.available).length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.cardTitle}>No slots available</Text>
                  <Text style={styles.muted}>Try another date or doctor.</Text>
                </View>
              ) : (
                <View style={styles.slotGrid}>
                  {slots
                    .filter((s) => s.available)
                    .map((slot) => {
                      const active = selectedSlot?.id === slot.id;
                      return (
                        <Pressable
                          key={slot.id}
                          onPress={() => setSelectedSlot(slot)}
                          style={[
                            styles.slotChip,
                            active && styles.slotChipActive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.slotText,
                              active && styles.dateTextActive,
                            ]}
                          >
                            {new Date(slot.startsAt).toLocaleTimeString([], {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </Text>
                        </Pressable>
                      );
                    })}
                </View>
              )}
              {!!bookingError && (
                <Text style={styles.errorText}>{bookingError}</Text>
              )}
              <Pressable
                disabled={!selectedSlot || bookingLoading}
                onPress={confirmBooking}
                style={[
                  styles.primaryButton,
                  (!selectedSlot || bookingLoading) && { opacity: 0.55 },
                ]}
              >
                {bookingLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>
                    Confirm appointment
                  </Text>
                )}
              </Pressable>
            </>
          )}
          <Text style={styles.sectionHeading}>Your bookings</Text>
          {bookings.length === 0 ? (
            <Text style={styles.muted}>{t(language, "noBookings")}</Text>
          ) : (
            bookings.map((booking) => {
              const doctor = doctors.find((d) => d.id === booking.doctorId);
              const slot = slots.find((s) => s.id === booking.slotId);
              return (
                <View key={booking.id} style={styles.listCard}>
                  <Text style={styles.bookingCheck}>✓</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>
                      {doctor?.name ?? "Doctor appointment"}
                    </Text>
                    <Text style={styles.muted}>
                      {slot
                        ? new Date(slot.startsAt).toLocaleString()
                        : `Appointment ref: ${booking.id}`}
                    </Text>
                    <Text style={styles.successText}>Confirmed</Text>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}

      {screen === "prescriptions" && (
        <ScrollView contentContainerStyle={styles.screenPad}>
          <Text style={styles.pageTitle}>Your prescriptions</Text>
          {!!prescriptionError && (
            <Pressable
              onPress={async () => {
                try {
                  setPrescriptions(await getPrescriptions());
                  setPrescriptionError("");
                } catch {
                  setPrescriptionError("Still unable to connect.");
                }
              }}
              style={styles.notice}
            >
              <Text style={styles.noticeText}>{prescriptionError} · Retry</Text>
            </Pressable>
          )}
          {prescriptions.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.cardTitle}>
                {t(language, "noPrescriptions")}
              </Text>
              <Text style={styles.muted}>
                Your clinic will share prescriptions after your visit.
              </Text>
            </View>
          ) : (
            prescriptions.map((rx) => {
              const expanded = expandedPrescription === rx.id;
              return (
                <View key={rx.id} style={styles.rxCard}>
                  <Pressable
                    onPress={() =>
                      setExpandedPrescription(expanded ? null : rx.id)
                    }
                    style={styles.rxHeader}
                  >
                    <View style={styles.rxIcon}>
                      <Text style={{ fontSize: 24 }}>📄</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>{rx.doctorName}</Text>
                      <Text style={styles.muted}>{rx.clinicName}</Text>
                      <Text style={styles.muted}>Issued {rx.issuedAt}</Text>
                    </View>
                    <Text style={styles.arrow}>{expanded ? "−" : "+"}</Text>
                  </Pressable>
                  {expanded && (
                    <View style={{ gap: 12, paddingTop: 10 }}>
                      {(["morning", "afternoon", "night"] as const).map(
                        (time) => {
                          const list = rx.medicines.filter((m) =>
                            m.timing.includes(time),
                          );
                          if (!list.length) return null;
                          const label = t(language, time);
                          return (
                            <View key={time} style={styles.timingGroup}>
                              <Text style={styles.sectionHeading}>
                                {time === "morning"
                                  ? "☀️ "
                                  : time === "afternoon"
                                    ? "🌤️ "
                                    : "🌙 "}
                                {label}
                              </Text>
                              {list.map((medicine) => {
                                const key = `${rx.id}-${medicine.id}-${time}`;
                                const taken = !!doseTaken[key];
                                return (
                                  <View
                                    key={medicine.id}
                                    style={styles.medicineRow}
                                  >
                                    <View style={{ flex: 1 }}>
                                      <Text style={styles.cardTitle}>
                                        {medicine.name}
                                      </Text>
                                      <Text style={styles.muted}>
                                        {medicine.dose} · {medicine.days} days
                                      </Text>
                                    </View>
                                    <Pressable
                                      onPress={() =>
                                        setDoseTaken((previous) => ({
                                          ...previous,
                                          [key]: !previous[key],
                                        }))
                                      }
                                      style={[
                                        styles.takenButton,
                                        taken && styles.takenButtonActive,
                                      ]}
                                    >
                                      <Text
                                        style={[
                                          styles.takenText,
                                          taken && styles.takenTextActive,
                                        ]}
                                      >
                                        {taken
                                          ? `✓ ${t(language, "taken")}`
                                          : t(language, "markTaken")}
                                      </Text>
                                    </Pressable>
                                  </View>
                                );
                              })}
                            </View>
                          );
                        },
                      )}
                    </View>
                  )}
                </View>
              );
            })
          )}
        </ScrollView>
      )}

      {screen === "profile" && (
        <ScrollView contentContainerStyle={styles.screenPad}>
          <Text style={styles.pageTitle}>Settings & demo controls</Text>
          <View style={styles.listCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Festival theme</Text>
              <Text style={styles.muted}>
                Switch home sections and colors at runtime.
              </Text>
            </View>
            <Switch
              value={festival}
              onValueChange={toggleFestival}
              trackColor={{ true: theme.colors.primary }}
            />
          </View>
          <View style={styles.listCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Request latency</Text>
              <Text style={styles.muted}>
                {mockSettings.latencyMs} ms simulated delay
              </Text>
            </View>
            <View style={{ flexDirection: "row", gap: 6 }}>
              <Pressable
                onPress={() => {
                  mockSettings.latencyMs = 350;
                }}
                style={styles.smallControl}
              >
                <Text>Normal</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  mockSettings.latencyMs = 2200;
                }}
                style={styles.smallControl}
              >
                <Text>Slow</Text>
              </Pressable>
            </View>
          </View>
          <View style={styles.listCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Force API failure</Text>
              <Text style={styles.muted}>
                Use this to demonstrate recovery states.
              </Text>
            </View>
            <Switch
              value={mockSettings.forceFailure}
              onValueChange={(value) => {
                mockSettings.forceFailure = value;
              }}
              trackColor={{ true: theme.colors.primary }}
            />
          </View>
          <View style={styles.listCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Empty prescriptions</Text>
              <Text style={styles.muted}>Test the designed empty state.</Text>
            </View>
            <Switch
              value={mockSettings.emptyPrescriptions}
              onValueChange={async (value) => {
                mockSettings.emptyPrescriptions = value;
                try {
                  setPrescriptions(await getPrescriptions());
                  setPrescriptionError("");
                } catch {
                  setPrescriptionError("Could not load prescriptions.");
                }
              }}
              trackColor={{ true: theme.colors.primary }}
            />
          </View>
          <Pressable onPress={refreshAll} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Refresh data</Text>
          </Pressable>
          <Text style={styles.muted}>
            Demo data only · Tapza Care prototype
          </Text>
        </ScrollView>
      )}

      <View style={styles.tabBar}>
        {config.tabs.map((tab) => {
          const active = screen === tab.screen;
          return (
            <Pressable
              key={tab.id}
              onPress={() => {
                setScreen(tab.screen);
                if (tab.screen !== "bookings") {
                  setSelectedDoctor(null);
                  setSelectedService(null);
                }
              }}
              style={styles.tabItem}
            >
              <Text
                style={[
                  styles.tabIcon,
                  active && { color: theme.colors.primary },
                ]}
              >
                {tab.icon}
              </Text>
              <Text
                style={[
                  styles.tabLabel,
                  active && { color: theme.colors.primary, fontWeight: "800" },
                ]}
              >
                {language === "hi"
                  ? (
                      {
                        home: "होम",
                        bookings: "बुकिंग",
                        prescriptions: "दवाइयाँ",
                        profile: "और",
                      } as const
                    )[tab.screen]
                  : tab.label}
              </Text>
              {active && (
                <View
                  style={[
                    styles.tabDot,
                    { backgroundColor: theme.colors.primary },
                  ]}
                />
              )}
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

function makeStyles(theme: ReturnType<typeof createTheme>) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.colors.background },
    header: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 16,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    headerCompact: { paddingTop: 7, paddingBottom: 9 },
    brand: {
      color: "#FFFFFF",
      fontSize: theme.typography.title,
      fontWeight: "900",
    },
    headerSub: { color: "#E6FFFA", fontSize: 13, marginTop: 4 },
    languagePill: {
      borderRadius: 99,
      minWidth: 48,
      minHeight: 44,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 10,
      backgroundColor: "#FFFFFF22",
    },
    languageText: { color: "#FFFFFF", fontWeight: "800", fontSize: 13 },
    screenPad: { padding: theme.spacing.md, paddingBottom: 28, gap: 12 },
    pageTitle: {
      color: theme.colors.textPrimary,
      fontSize: theme.typography.heading,
      fontWeight: "900",
      marginBottom: 3,
    },
    sectionHeading: {
      color: theme.colors.textPrimary,
      fontSize: theme.typography.subtitle,
      fontWeight: "800",
      marginTop: 12,
      marginBottom: 9,
    },
    bodyText: {
      color: theme.colors.textSecondary,
      fontSize: theme.typography.body,
      lineHeight: 23,
    },
    muted: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      lineHeight: 19,
      marginTop: 3,
    },
    listCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      padding: 15,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    cardTitle: {
      color: theme.colors.textPrimary,
      fontSize: 15,
      fontWeight: "800",
    },
    price: {
      color: theme.colors.primary,
      fontWeight: "800",
      fontSize: 14,
      marginTop: 5,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.secondary,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: { fontSize: 20, fontWeight: "900" },
    arrow: {
      color: theme.colors.primary,
      fontSize: 28,
      fontWeight: "500",
      paddingHorizontal: 5,
    },
    outlineButton: {
      borderWidth: 1,
      borderColor: theme.colors.primary,
      borderRadius: 10,
      paddingHorizontal: 12,
      minHeight: 44,
      justifyContent: "center",
    },
    outlineText: { color: theme.colors.primary, fontWeight: "800" },
    dateChip: {
      backgroundColor: theme.colors.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.colors.border,
      minWidth: 58,
      minHeight: 68,
      alignItems: "center",
      justifyContent: "center",
      padding: 8,
    },
    dateChipActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    dateDay: { color: theme.colors.textSecondary, fontSize: 12 },
    dateNumber: {
      color: theme.colors.textPrimary,
      fontSize: 20,
      fontWeight: "900",
      marginTop: 3,
    },
    dateTextActive: { color: "#FFFFFF" },
    slotGrid: { flexDirection: "row", flexWrap: "wrap", gap: 9 },
    slotChip: {
      minWidth: "30%",
      minHeight: 48,
      borderRadius: 12,
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 10,
    },
    slotChipActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    slotText: {
      color: theme.colors.textPrimary,
      fontWeight: "700",
      fontSize: 13,
    },
    primaryButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 14,
      minHeight: 50,
      alignItems: "center",
      justifyContent: "center",
      padding: 14,
      marginTop: 8,
    },
    primaryButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" },
    errorText: { color: theme.colors.error, fontSize: 14, marginVertical: 8 },
    successText: {
      color: theme.colors.success,
      fontSize: 12,
      fontWeight: "800",
      marginTop: 4,
    },
    bookingCheck: {
      color: theme.colors.success,
      fontSize: 25,
      fontWeight: "900",
    },
    emptyCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      padding: 24,
      alignItems: "center",
      gap: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    emptyIcon: { fontSize: 32 },
    rxCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      padding: 15,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    rxHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
    rxIcon: {
      width: 48,
      height: 48,
      borderRadius: 14,
      backgroundColor: theme.colors.secondary,
      alignItems: "center",
      justifyContent: "center",
    },
    timingGroup: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      paddingTop: 7,
    },
    medicineRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingVertical: 9,
    },
    takenButton: {
      borderRadius: 10,
      minHeight: 44,
      borderWidth: 1,
      borderColor: theme.colors.primary,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 10,
    },
    takenButtonActive: { backgroundColor: theme.colors.primary },
    takenText: { color: theme.colors.primary, fontSize: 12, fontWeight: "800" },
    takenTextActive: { color: "#FFFFFF" },
    notice: {
      marginHorizontal: 16,
      marginTop: 12,
      padding: 12,
      backgroundColor: theme.colors.secondary,
      borderRadius: 12,
    },
    noticeText: {
      color: theme.colors.textPrimary,
      fontSize: 13,
      fontWeight: "700",
    },
    loadingBlock: { padding: 20, gap: 14 },
    skeleton: {
      height: 95,
      borderRadius: 18,
      backgroundColor: theme.colors.secondary,
      opacity: 0.8,
      marginTop: 5,
    },
    sheetHandle: { marginTop: 14 },
    handleBar: {
      width: 42,
      height: 5,
      borderRadius: 9,
      backgroundColor: theme.colors.border,
      alignSelf: "center",
      marginBottom: 6,
    },
    smallControl: {
      borderRadius: 10,
      paddingHorizontal: 9,
      minHeight: 40,
      justifyContent: "center",
      backgroundColor: theme.colors.background,
    },
    tabBar: {
      flexDirection: "row",
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      paddingTop: 7,
      paddingBottom: 4,
    },
    tabItem: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 48,
      gap: 2,
    },
    tabIcon: { fontSize: 20, color: theme.colors.textSecondary },
    tabLabel: { fontSize: 11, color: theme.colors.textSecondary },
    tabDot: { height: 3, width: 16, borderRadius: 99, marginTop: 1 },
  });
}
