import { Image } from "expo-image";
import { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  Modal,
  TextInput,
} from "react-native";

import defaultAvatar from "../assets/defaultAvatar.png";
import i18n from "../i18n/i18n";
import { useMapStore } from "../stores/useMapStore";
import { settingsList } from "../utils/settingsList";

export default function Settings() {
  const handleSetDangerAreaMapColor = useMapStore(
    (state) => state.handleSetDangerAreaMapColor
  );
  const handleSetPredictionsDayForward = useMapStore(
    (state) => state.handleSetPredictionsDayForward
  );
  const handleSetWeatherParams = useMapStore(
    (state) => state.handleSetWeatherParams
  );

  const mapColor = useMapStore((state) => state.dangerAreaMapColor);
  const predictionsDayForward = useMapStore(
    (state) => state.predictionsDayForward
  );
  const weatherParams = useMapStore((state) => state.weatherParams);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [userName, setUserName] = useState("Krystian Jank");
  const [inputName, setInputName] = useState("Krystian Jank");
  const [userEmail, setUserEmail] = useState("s24586@pjwstk.edu.pl");
  const [inputEmail, setInputEmail] = useState("s24586@pjwstk.edu.pl");

  const numberOfPredictions = [0, 1, 2, 3, 4, 5];
  const circleMapColors = [
    "rgba(255, 0, 0, 0.5)",
    "rgba(200, 0, 0, 0.5)",
    "rgba(255, 69, 0, 0.5)",
    "rgba(255, 140, 0, 0.5)",
    "rgba(255, 165, 0, 0.5)",
    "rgba(255, 215, 0, 0.5)",
    "rgba(255, 255, 0, 0.5)",
    "rgba(255, 99, 71, 0.5)",
  ];

  const handleOpenDesktopApp = async () => {
    // Documentation:
    // Function check if can open url in browser,if its supported open in deafult browser
    const url = "https://asg.dev.rafal.sojecki.pl/";
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (err) {
      console.error("An error occurred", err);
      Alert.alert(i18n.t("error"), i18n.t("couldNotOpenLink"));
    }
  };

  const handleOpenModal = (item) => {
    // Documentation:
    // Function to save items in states and opens popup
    // PARAMETERS:
    // - item - clicked in list
    setSelectedItem(item);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    // Documentation:
    // Function to reset states
    setModalVisible(false);
    setSelectedItem(null);
  };

  const handleChangeUserProfile = () => {
    // Documentation:
    // Function to change states of username and email
    setUserName(inputName);
    setUserEmail(inputEmail);
    handleCloseModal();
  };

  const renderModalContent = () => {
    // Documentation:
    // Function to render content of the opened popup
    if (!selectedItem) {
      return null;
    }

    switch (selectedItem.title) {
      case "profile":
        return (
          <View style={styles.modalContentContainer}>
            <Text style={styles.modalTitle}>{i18n.t("editProfile")}</Text>
            <Text style={styles.modalLabel}>{i18n.t("name")}:</Text>
            <TextInput
              style={styles.modalTextInput}
              value={inputName}
              onChangeText={setInputName}
              placeholder={i18n.t("name")}
              maxLength={30}
            />
            <Text style={styles.modalLabel}>{i18n.t("email")}:</Text>
            <TextInput
              style={styles.modalTextInput}
              value={inputEmail}
              onChangeText={setInputEmail}
              placeholder={i18n.t("email")}
              keyboardType="email-address"
              maxLength={30}
            />
            <TouchableOpacity
              style={[styles.button, styles.buttonSave]}
              onPress={() => {
                handleChangeUserProfile();
              }}
            >
              <Text style={styles.textStyle}>{i18n.t("save")}</Text>
            </TouchableOpacity>
          </View>
        );

      case "language":
        return (
          <View style={styles.modalContentContainer}>
            <Text style={styles.modalTitle}>{i18n.t("changeLanguage")}</Text>
            <TouchableOpacity
              style={[
                styles.languageButton,
                i18n.locale === "pl" && styles.languageButtonActive,
              ]}
              onPress={() => {
                i18n.locale = "pl";
                Alert.alert(i18n.t("languageChanged"), i18n.t("polish"));
                handleCloseModal();
              }}
            >
              <Text style={styles.languageButtonText}>{i18n.t("polish")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.languageButton,
                i18n.locale === "en" && styles.languageButtonActive,
              ]}
              onPress={() => {
                i18n.locale = "en";
                Alert.alert(i18n.t("languageChanged"), i18n.t("english"));
                handleCloseModal();
              }}
            >
              <Text style={styles.languageButtonText}>{i18n.t("english")}</Text>
            </TouchableOpacity>
          </View>
        );

      case "predictions":
        return (
          <View style={styles.modalContentContainer}>
            <Text style={styles.modalTitle}>{i18n.t("selectPredictions")}</Text>
            <View style={styles.predictionButtonsContainer}>
              {numberOfPredictions.map((num) => (
                <TouchableOpacity
                  key={num}
                  style={[
                    styles.predictionButton,
                    predictionsDayForward === num &&
                      styles.predictionButtonActive,
                  ]}
                  onPress={() => {
                    handleSetPredictionsDayForward(num);
                    Alert.alert(
                      i18n.t("predictionSet"),
                      `${i18n.t("selected")}: ${num}.`
                    );
                    handleCloseModal();
                  }}
                >
                  <Text style={styles.predictionButtonText}>{num}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case "weatherParams":
        return (
          <View style={styles.modalContentContainer}>
            <Text style={styles.modalTitle}>
              {i18n.t("selectWeatherParams")}
            </Text>
            <View style={styles.predictionButtonsContainer}>
              {weatherParams.map((param) => (
                <TouchableOpacity
                  key={param.name}
                  style={[
                    styles.weatherParamsButton,
                    param.active && styles.predictionButtonActive,
                  ]}
                  onPress={() => {
                    handleSetWeatherParams(param.name);
                  }}
                >
                  <Text style={styles.weatherParamsButtonText}>
                    {param.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case "map":
        return (
          <View style={styles.modalContentContainer}>
            <Text style={styles.modalTitle}>{i18n.t("selectMapColor")}</Text>
            <View style={styles.colorOptionsContainer}>
              {circleMapColors.map((color, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    mapColor === color && styles.colorOptionActive,
                  ]}
                  onPress={() => {
                    handleSetDangerAreaMapColor(color);
                    Alert.alert(
                      i18n.t("mapColorChanged"),
                      `${i18n.t("selectedColor")}: ${color}.`
                    );
                    handleCloseModal();
                  }}
                />
              ))}
            </View>
          </View>
        );
      case "help":
        return (
          <View style={styles.modalContentContainer}>
            <Text style={styles.modalTitle}>{i18n.t("helpAndSupport")}</Text>
            <Text style={styles.modalDescription}>{i18n.t("helpText")}</Text>
          </View>
        );
      case "Desktop":
        return (
          <View style={styles.modalContentContainer}>
            <Text style={styles.modalTitle}>{i18n.t("desktop")}</Text>
            <Text style={styles.modalDescription}>
              {i18n.t("openDesktopVersion")}
            </Text>
          </View>
        );
      default:
        return (
          <View style={styles.modalContentContainer}>
            <Text style={styles.modalTitle}>
              {selectedItem.titleKey
                ? i18n.t(selectedItem.titleKey)
                : selectedItem.title}
            </Text>
            <Text style={styles.modalDescription}>
              {selectedItem.descriptionKey
                ? i18n.t(selectedItem.descriptionKey)
                : selectedItem.description}
            </Text>
          </View>
        );
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* <TouchableOpacity style={styles.profileSection}>
        <Image source={defaultAvatar} style={styles.profileImage} />
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{userName}</Text>
          <Text style={styles.profileEmail}>{userEmail}</Text>
        </View>
      </TouchableOpacity> */}

      <View style={styles.settingsList}>
        {settingsList.map((el, index) => (
          <TouchableOpacity
            key={index}
            style={styles.settingItem}
            onPress={() => {
              if (el.title === "Desktop") {
                handleOpenDesktopApp();
              } else {
                handleOpenModal(el);
              }
            }}
          >
            <View style={styles.settingIcon}>{el.icon}</View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>
                {el.title ? i18n.t(el.title) : el.title}
              </Text>
              <Text style={styles.settingDescription}>
                {el.description ? i18n.t(el.description) : el.description}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {renderModalContent()}
            <TouchableOpacity
              style={[styles.button, styles.buttonClose]}
              onPress={() => {
                if (selectedItem.title === "weatherParams") {
                  Alert.alert(i18n.t("selectedWeatherParams"));
                }
                handleCloseModal();
              }}
            >
              <Text style={styles.textStyle}>{i18n.t("close")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 60,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    marginBottom: 10,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  profileEmail: {
    fontSize: 14,
    color: "gray",
  },
  settingsList: {
    paddingHorizontal: 10,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 25,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingIcon: {
    marginRight: 15,
    width: 30,
    alignItems: "center",
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: "#333",
  },
  settingDescription: {
    fontSize: 12,
    color: "gray",
    marginTop: 2,
  },

  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "80%",
  },
  modalContentContainer: {
    width: "100%",
    alignItems: "center",
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
  },
  modalDescription: {
    marginBottom: 20,
    textAlign: "center",
    fontSize: 16,
    color: "gray",
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 15,
  },
  buttonClose: {
    backgroundColor: "#8ECA96",
  },
  buttonSave: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalLabel: {
    alignSelf: "flex-start",
    marginTop: 10,
    marginBottom: 5,
    fontSize: 16,
    fontWeight: "bold",
  },
  modalTextInput: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  languageButton: {
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#8ECA96",
    marginVertical: 5,
    width: "70%",
    alignItems: "center",
  },
  languageButtonActive: {
    backgroundColor: "#8ECA96",
  },
  languageButtonText: {
    fontSize: 16,
    color: "#333",
  },
  predictionButtonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  predictionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    margin: 5,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  weatherParamsButton: {
    width: 110,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    margin: 5,
    borderWidth: 1,
    borderColor: "#ccc",
  },

  predictionButtonActive: {
    backgroundColor: "#8ECA96",
    borderColor: "#8ECA96",
  },
  predictionButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  weatherParamsButtonText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333",
  },
  colorOptionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },
  colorOptionActive: {
    border: 1,
    borderColor: "red",
  },
});
