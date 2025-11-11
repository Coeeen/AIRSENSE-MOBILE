import { useFocusEffect } from "@react-navigation/native";
import moment from "moment";
import React, { useState, useCallback } from "react";
import { View, StyleSheet, Text, ActivityIndicator } from "react-native";
import MapView, { Circle } from "react-native-maps";

import i18n from "../i18n/i18n";
import { useMapStore } from "../stores/useMapStore";

export default function Map() {
  const getMeasurementArea = useMapStore((state) => state.getMeasurementArea);
  const dangerAreaMapColor = useMapStore((state) => state.dangerAreaMapColor);
  const weatherParams = useMapStore((state) => state.weatherParams);
  const predictionsDayForward = useMapStore(
    (state) => state.predictionsDayForward
  );

  const [circles, setCircles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      // Documentation:
      // This effect runs when the screen is focused and weatherParams and predictionsDayForward are changed.
      // It fetches the data based on active weather parameters,location and the current date.
      const now = moment();
      const currentDate = now.format("YYYY-MM-DD");
      const formatedForwardDate = now
        .clone()
        .add(predictionsDayForward, "days")
        .format("YYYY-MM-DD");

      const fetchData = async () => {
        const activeParamStore = weatherParams
          .filter((param) => param.active)
          .map((param) => param.name);

        //console.log("Daty:", currentDate, formatedForwardDate);

        const data = {
          type: activeParamStore,
          x_lat: 54.3012,
          x_lng: 18.0012,
          y_lat: 55.3525,
          y_lng: 19.6482,
          from: currentDate,
          to: formatedForwardDate,
        };

        try {
          setIsLoading(true);
          const res = await getMeasurementArea(data);
          if (res?.data) {
            setCircles(res.data);
          }
        } catch (e) {
          console.error("Błąd pobierania danych:", e);
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }, [weatherParams, predictionsDayForward])
  );

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>{i18n.t("loading")}</Text>
        </View>
      ) : (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 54.35,
            longitude: 18.65,
            latitudeDelta: 0.2,
            longitudeDelta: 0.2,
          }}
        >
          {circles.map((point, index) => (
            <Circle
              key={index}
              center={{
                latitude: point.lat,
                longitude: point.lng,
              }}
              radius={400}
              fillColor={dangerAreaMapColor}
              strokeColor={dangerAreaMapColor}
              strokeWidth={1}
            />
          ))}
        </MapView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
});
