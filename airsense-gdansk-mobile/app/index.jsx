import { useFocusEffect } from "@react-navigation/native";
import { Image } from "expo-image";
import * as Location from "expo-location";
import moment from "moment";
import { useState, useCallback } from "react";
import { View, StyleSheet, Alert } from "react-native";

import backgroundImage from "../assets/backgrounds/main.png";
import {ActuallLocationCard} from '../components/Main/ActuallLocationCard/ActualLocationCard';
import {ForecastCard} from '../components/Main/ForecastCard';
import i18n from "../i18n/i18n";
import { useMapStore } from "../stores/useMapStore";

export default function App() {
  const getMeasurementArea = useMapStore((state) => state.getMeasurementArea);
  
  const weatherParams = useMapStore((state) => state.weatherParams);
  const predictionsDayForward = useMapStore(
    (state) => state.predictionsDayForward
  );
  const [location, setLocation] = useState(null);
  const [locationData, setLocationData] = useState(null);
  const [currentDate, setCurrentDate] = useState("");
  const [formatedForwardDate, setFormatedForwardDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  useFocusEffect(
    useCallback(() => {
      // Documentation:
      // Run this effect only once when the screen is focused,memoized with useCallback to optimize performance (useCallback = func,useMemo = value).
      // Ask for location permissions and get the current location.
      // Set up an interval to update the current date and time every minute.
      // Clear the interval when the component is unmounted or when the effect is re-run.
      let interval;

      const getCurrentDate = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            i18n.t("errorDownloadLocation"),
            i18n.t("errorDownloadLocation")
          );
          return;
        }

        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc);

        const handleUpdateDateTime = () => {
          const now = moment();
          setCurrentDate(now.format("YYYY-MM-DD"));
          setFormatedForwardDate(
            now.clone().add(predictionsDayForward, "days").format("YYYY-MM-DD")
          );
          setCurrentTime(now.format("HH:mm"));
        };

        interval = setInterval(handleUpdateDateTime, 60000);
        handleUpdateDateTime();
      };

      getCurrentDate();

      return () => {
        if (interval) clearInterval(interval);
      };
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      // Documentation:
      // This effect runs when the screen is focused and currentDate and location are available.
      // It fetches the data based on active weather parameters,location and the current date.
      if (!currentDate || !location) return;

      const fetchLocationAndData = async () => {
        const activeParamStore = weatherParams
          .filter((param) => param.active === true)
          .map((param) => param.name);

        const data = {
          type: activeParamStore,
          x_lat: 54.3012 - 0.5,
          x_lng: 18.0012 - 0.5,
          y_lat: 55.3525 + 0.5,
          y_lng: 19.6482 + 0.5,
          from: "2024-01-01",
          to: formatedForwardDate,
        };

        try {
          const res = await getMeasurementArea(data);
          if (res?.data) {
            setLocationData(res.data);
          }
        } catch (e) {
          console.error("Błąd pobierania danych:", e);
        }
      };

      fetchLocationAndData();
    }, [])
  );

  const isStinkyOnDate = (dateToCheck) => {
    // Documentation:
    // This function checks if there is a "stink" type data for a specific date.
    // It formats received date to "YYYY-MM-DD" and searches for a matching entry in locationData.
    // Next find element with type 'stink' then format el date and compare to received date and check if is greater to 0
    // If there is any smelly data, make it boolean (!!).

    if (!locationData) return false;
    const dateFormatted = moment(dateToCheck).format("YYYY-MM-DD");
    const smellyData = locationData.find(
      (el) =>
        el.type === "stink" &&
        moment(el.time).format("YYYY-MM-DD") === dateFormatted &&
        el.value > 0
    );
    return !!smellyData;
  };

  return (
    <View style={styles.container} testID="app-container">
      <Image source={backgroundImage} style={StyleSheet.absoluteFill} contentFit="cover" />
      <View style={styles.cardsContainer}>
        <ActuallLocationCard currentTime={currentTime} currentDate={currentDate} locationData={location} />
        <ForecastCard predictionsDayForward={predictionsDayForward} isStinkyOnDate={isStinkyOnDate} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    paddingTop: 70,
  },
  cardsContainer: {
    flex: 1,
    alignItems: "center",
  }
});
