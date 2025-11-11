import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import moment from "moment";
import { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  Text,
  Modal,
  TextInput,
  Button,
  Pressable,
  ScrollView,
  FlatList,
} from "react-native";

import { LocationsListItem } from '../../components/Locations/List/Item/LocationsListItem'
import { LocationsMap } from '../../components/Locations/LocationsMap'
import i18n from "../../i18n/i18n";
import { useMapStore } from "../../stores/useMapStore";

const STORAGE_KEY = "@saved_locations";

export default function Locations() {
  const getMeasurementArea = useMapStore((state) => state.getMeasurementArea);
  const weatherParams = useMapStore((state) => state.weatherParams);
  const predictionsDayForward = useMapStore(
    (state) => state.predictionsDayForward
  );

  const [circles, setCircles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [showSavedLocations, setShowSavedLocations] = useState(false);
  const [savedLocations, setSavedLocations] = useState([]);

  const [createLocationPopUp, setCreateLocationPopUp] = useState(false);
  const [clickedLocation, setClickedLocation] = useState(null);
  const [locationFormData, setLocationlocationFormData] = useState({
    name: "",
    description: "",
  });

  

  useFocusEffect(
    // Documentation:
    // This effect runs when the screen is focused.Memoized with useCallback to optimize performance (useCallback = func,useMemo = value).
    //Close all panel and load locations
    useCallback(() => {
      setShowMap(false);
      setShowSavedLocations(false);
      loadSavedLocations();
    }, [])
  );

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

  const loadSavedLocations = async () => {
    // Documentation:
    // Function get all items from key STORAGE_KEY the check if the list is empty
    // if its not empty parse data to Array format if its empty set empty location
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      if (jsonValue != null) {
        setSavedLocations(JSON.parse(jsonValue));
      } else {
        setSavedLocations([]);
      }
    } catch (e) {
      console.error("Błąd wczytywania lokalizacji:", e);
    }
  };

  const saveLocation = async (location) => {
    // Documentation:
    // This function gets a new location, creates a new array combining savedLocations and the new location,
    // then saves this updated array to AsyncStorage under the key STORAGE_KEY.
    // PARAMETERS:
    // - location: a new location object created from the form data
    try {
      const allLocations = [...savedLocations, location];
      setSavedLocations(allLocations);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(allLocations));
    } catch (e) {
      console.error("Błąd zapisu lokalizacji:", e);
    }
  };

  const handleMapPress = (event) => {
    const { coordinate } = event.nativeEvent;
    setClickedLocation(coordinate);
    setCreateLocationPopUp(true);
  };

  const handleSubmit = () => {
    // Documentation:
    // Function save the location and close/reset all states
    if (!clickedLocation || !locationFormData.name.trim()) {
      alert("Podaj nazwę lokalizacji i wybierz punkt na mapie.");
      return;
    }

    const newLocation = {
      id: Date.now().toString(),
      name: locationFormData.name.trim(),
      description: locationFormData.description.trim(),
      coordinate: clickedLocation,
    };

    saveLocation(newLocation);
    setCreateLocationPopUp(false);
    setLocationlocationFormData({ name: "", description: "" });
    setClickedLocation(null);
    setShowMap(false);
  };  

  return (
    <View style={styles.container}>
      {!showMap && !showSavedLocations && (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.heading}>{i18n.t("favouriteHeader")}</Text>
          <Text style={styles.paragraph}>{i18n.t("favouriteDescription")}</Text>

          <View style={styles.buttonGroup}>
            <Pressable
              style={styles.button}
              onPress={() => {
                setShowSavedLocations(true);
              }}
            >
              <Text style={styles.buttonText} testID="favouriteSavedLocations">
                {i18n.t("favouriteSavedLocations")}
              </Text>
            </Pressable>

            <Pressable style={styles.button} onPress={() => setShowMap(true)}>
              <Text style={styles.buttonText} testID="favouriteAddLocation">
                {i18n.t("favouriteAddLocation")}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      )}

      {showSavedLocations && (
        <View style={{ flex: 1, padding: 20 }}>
          <Button
            title="Powrót"
            onPress={() => setShowSavedLocations(false)}
            color="#71A78F"
          />
          {savedLocations.length === 0 ? (
            <Text style={{ marginTop: 20, textAlign: "center" }}>
              {i18n.t("noDataLocations")}
            </Text>
          ) : (
            <FlatList
              data={savedLocations}
              keyExtractor={(item) => item.id}
              renderItem={LocationsListItem}
              contentContainerStyle={{ marginTop: 20 }}
            />
          )}
        </View>
      )}

      {showMap && (
        <View style={{ flex: 1 }}>
          <LocationsMap measurementData={circles} savedLocations={savedLocations} clickedLocation={clickedLocation} onMapPress={handleMapPress} isLoading={isLoading} />
        </View>
      )}

      <Modal
        visible={createLocationPopUp}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCreateLocationPopUp(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.label}>
              {i18n.t("createLocationInputName")}
            </Text>
            <TextInput
              style={styles.input}
              value={locationFormData.name}
              onChangeText={(text) =>
                setLocationlocationFormData({ ...locationFormData, name: text })
              }
              placeholder={i18n.t("createLocationInputNamePlaceholder")}
            />

            <Text style={styles.label}>
              {i18n.t("createLocationInputDescription")}
            </Text>
            <TextInput
              style={styles.input}
              value={locationFormData.description}
              onChangeText={(text) =>
                setLocationlocationFormData({
                  ...locationFormData,
                  description: text,
                })
              }
              placeholder={i18n.t("createLocationInputDescriptionPlaceholder")}
            />

            <View style={styles.buttonContainer}>
              <Button
                title={i18n.t("cancel")}
                color="gray"
                onPress={() => setCreateLocationPopUp(false)}
              />
              <Button title="Zapisz" onPress={handleSubmit} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  heading: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2A4930",
    marginBottom: 10,
    textAlign: "center",
  },
  paragraph: {
    fontSize: 14,
    color: "#4A4A4A",
    marginBottom: 20,
    textAlign: "center",
  },
  buttonGroup: {
    gap: 12,
    width: "100%",
  },
  button: {
    backgroundColor: "#71A78F",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
  },
  label: {
    fontWeight: "600",
    marginBottom: 4,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  }
});
