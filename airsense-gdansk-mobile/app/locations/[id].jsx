import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import moment from "moment";
import { useCallback, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";

import background from "../../assets/backgrounds/location.png";
import i18n from "../../i18n/i18n";
import { useMapStore } from "../../stores/useMapStore";

const STORAGE_KEY = "@saved_locations";

export default function LocationDetails() {
  const getMeasurementArea = useMapStore((state) => state.getMeasurementArea);
  const weatherParams = useMapStore((state) => state.weatherParams);
  const predictionsDayForward = useMapStore(
    (state) => state.predictionsDayForward
  );
  const { id } = useLocalSearchParams();
  const [location, setLocation] = useState(null);
  const [locationData, setLocationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [formatedForwardDate, setFormatedForwardDate] = useState("");

  useFocusEffect(
    useCallback(() => {
      // Documentation:
      // Run this effect only once when the screen is focused,memoized with useCallback to optimize performance (useCallback = func,useMemo = value).
      // Set up an interval to update the current date and time every minute.
      // Clear the interval when the component is unmounted or when the effect is re-run.
      const handleUpdateDateTime = () => {
        const now = moment();
        setCurrentDate(now.format("YYYY-MM-DD"));
        setFormatedForwardDate(
          now.clone().add(predictionsDayForward, "days").format("YYYY-MM-DD")
        );
        setCurrentTime(moment().format("HH:mm"));
      };

      handleUpdateDateTime();
      const interval = setInterval(handleUpdateDateTime, 60000);

      return () => clearInterval(interval);
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      // Documentation:
      // This effect runs when the screen is focused and weatherParams,id or predictionsDayForward are changed.
      // if currentDate isnt ready do nothing else, fetch the data based on active weather parameters,saved location and the current date.
      // Load locations from AsyncStorage,check if its not null (emppty list),parse list from JSON TO array then find location id from useLocalSearchParams
      // take lat and long to send it via API
      if (!currentDate) return;
      const loadLocationAndData = async () => {
        try {
          const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
          // console.log(jsonValue);

          if (jsonValue != null) {
            const locations = JSON.parse(jsonValue);
            const loc = locations.find((l) => l.id === String(id));
            // console.log(loc, ' "znaleziono lokalizację o id:", id);');
            setLocation(loc);

            const lat = loc?.coordinate?.latitude;
            const lng = loc?.coordinate?.longitude;

            if (!lat || !lng) {
              console.warn(
                "Brak współrzędnych geograficznych dla tej lokalizacji."
              );
              setLoading(false);
              return;
            }

            const activeParamStore = weatherParams
              .filter((param) => param.active === true)
              .map((param) => param.name);

            const data = {
              type: activeParamStore,
              x_lat: lat - 0.1,
              x_lng: lng - 0.1,
              y_lat: lat + 0.1,
              y_lng: lng + 0.1,
              from: currentDate,
              to: formatedForwardDate,
            };

            const res = await getMeasurementArea(data);
            if (res?.data) {
              //console.log("Wynik zapytania:", res.data);
              setLocationData(res.data);
            }
          }
        } catch (e) {
          console.error("Błąd wczytywania lokalizacji lub danych:", e);
        } finally {
          setLoading(false);
        }
      };

      loadLocationAndData();
    }, [id, currentDate, weatherParams])
  );

  const getValue = (type) => {
    // TODO:
    //  POWINNISMY TO PRZENIEŚĆ DO OSOBNEGO PLIKU UTILS BO  UZYWAMY TO W INNYCH MIEJSCACH!!!!
    // this function retrieves the value for a specific type (e.g., temperature, pressure) from the locationData.
    // It checks if locationData is available and returns the value for the current date.
    // If no data is found for the specified type and date, it returns null.
    if (!locationData) return null;
    const match = locationData.find(
      (item) =>
        item.type === type &&
        moment(item.time).format("YYYY-MM-DD") === currentDate
    );
    //console.log("Dane na dziś", match);
    return match?.value ?? null;
  };

  const isStinkyOnDate = (dateToCheck) => {
    // TODO:
    // POWINNISMY TO PRZENIEŚĆ DO OSOBNEGO PLIKU UTILS BO  UZYWAMY TO W INNYCH MIEJSCACH!!!!
    // Documentation:
    // This function checks if there is a "stink" type data for a specific date.
    // It formats received date to "YYYY-MM-DD" and searches for a matching entry in locationData.
    // Next find element with type 'stink' then format el date and compare to received date and check if is greater to 0
    // If there is any smelly data, make it boolean (!!).
    if (!locationData) return false;
    const dateFormatted = moment(dateToCheck).format("YYYY-MM-DD");
    const smellyData = locationData.find(
      (item) =>
        item.type === "stink" &&
        moment(item.time).format("YYYY-MM-DD") === dateFormatted &&
        item.value > 0
    );
    return !!smellyData;
  };

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  if (!location) {
    return (
      <View>
        <Text>
          {" "}
          {i18n.t("noFoundedLocation")} {id}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={background}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />

      <View style={styles.locationContainer}>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={{ fontSize: 18, color: "#71A78F", fontWeight: "500" }}>
              {i18n.t("selectedLocation")}
            </Text>

            <View style={styles.iconWithText}>
              <MaterialCommunityIcons
                name="white-balance-sunny"
                size={64}
                color="#71A78F"
              />
              <Text style={styles.mainText}>
                {Math.floor(getValue("temperature"))}°C
              </Text>
            </View>

            <Text style={styles.text}>{i18n.t("badSmell")}</Text>
            <Text style={styles.text}>{currentDate}</Text>
            <Text style={styles.text}>
              {i18n.t("actuallTime")} | {currentTime}
            </Text>

            <View style={styles.detailsContainer}>
              <View style={styles.rowIcons}>
                <View style={styles.detailItem}>
                  <MaterialCommunityIcons
                    name="gauge"
                    size={24}
                    color="#71A78F"
                  />
                  <Text style={styles.detailText}>
                    {" "}
                    {locationData?.pressure !== undefined
                      ? `${Math.floor(locationData.pressure)} hPa`
                      : "-- hPa"}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <MaterialCommunityIcons
                    name="weather-windy"
                    size={24}
                    color="#71A78F"
                  />
                  <Text style={styles.detailText}>
                    {" "}
                    {locationData?.wind_speed !== undefined
                      ? `${Math.floor(locationData.wind_speed)} km/h`
                      : "-- km/h"}
                  </Text>
                </View>
              </View>

              <View style={styles.rowIcons}>
                <View style={styles.detailItem}>
                  <MaterialCommunityIcons
                    name="chemical-weapon"
                    size={24}
                    color="#71A78F"
                  />
                  <Text style={styles.detailText}>
                    {" "}
                    {locationData?.pm25 !== undefined
                      ? `PM2.5: ${Math.floor(locationData.pm25)}`
                      : "PM2.5: ---"}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <MaterialCommunityIcons
                    name="cloud-outline"
                    size={24}
                    color="#71A78F"
                  />
                  <Text style={styles.detailText}>
                    {" "}
                    {locationData?.o3 !== undefined
                      ? `O₃: ${Math.floor(locationData.o3)}`
                      : "O₃: --"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <LinearGradient
          colors={["rgba(174, 238, 182, 0.8)", "rgba(174, 238, 182, 0.7)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.weatherCard}
        >
          <View style={styles.forecastContainer}>
            <Text
              style={{
                fontSize: 16,
                color: "#71A78F",
                fontWeight: "500",
                marginBottom: 10,
                textAlign: "center",
                width: "100%",
              }}
            >
              {i18n.t("predictedWeather")}
            </Text>
            {[...Array(predictionsDayForward)].map((_, i) => {
              const date = moment().add(i, "days");
              const day = date.format("DD");
              const month = date.locale("pl").format("MMM");

              const isSmelly = isStinkyOnDate(date);

              return (
                <View key={i} style={styles.forecastItem}>
                  <Text style={styles.forecastDate}>
                    {day} {month}
                  </Text>
                  <MaterialCommunityIcons
                    name={isSmelly ? "skull-outline" : "emoticon-happy-outline"}
                    size={28}
                    color={isSmelly ? "#FF6B6B" : "#4CAF50"}
                  />
                </View>
              );
            })}
          </View>
        </LinearGradient>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  locationContainer: {
    flex: 1,
    alignItems: "center",
  },
  card: {
    alignItems: "center",
    backgroundColor: "#AEEEB6",
    width: "80%",
    height: 350,
    padding: 25,
    marginTop: 70,
    borderRadius: 25,
  },
  row: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  iconWithText: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  text: {
    fontSize: 18,
    color: "#71A78F",
    fontWeight: "500",
    marginVertical: 5,
  },
  mainText: {
    fontSize: 64,
    color: "#71A78F",
    fontWeight: "500",
    marginLeft: 10,
    textAlign: "center",
  },
  weatherCard: {
    width: "80%",
    padding: 10,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 15,
  },
  detailsContainer: {
    marginTop: 20,
    width: "100%",
  },
  rowIcons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "40%",
  },
  detailText: {
    marginLeft: 8,
    color: "#71A78F",
    fontSize: 16,
    fontWeight: "500",
  },
  forecastContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
  },
  forecastItem: {
    width: "30%",
    alignItems: "center",
    marginVertical: 5,
  },
  forecastDate: {
    fontSize: 14,
    color: "#71A78F",
    marginBottom: 4,
  },
});
