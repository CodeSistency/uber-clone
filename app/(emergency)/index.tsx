import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Dummy emergency contacts data
const DUMMY_EMERGENCY_CONTACTS = [
  {
    id: "EC_001",
    name: "Emergency Contact 1",
    phone: "+1 (555) 123-4567",
    relationship: "Family",
  },
  {
    id: "EC_002",
    name: "Emergency Contact 2",
    phone: "+1 (555) 987-6543",
    relationship: "Friend",
  },
];

const EmergencyContacts = () => {
  const [contacts, setContacts] = useState(DUMMY_EMERGENCY_CONTACTS);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newContact, setNewContact] = useState({
    name: "",
    phone: "",
    relationship: "",
  });

  const handleAddContact = () => {
    if (!newContact.name || !newContact.phone) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    const contact = {
      id: `EC_${Date.now()}`,
      ...newContact,
    };

    setContacts([...contacts, contact]);
    setNewContact({ name: "", phone: "", relationship: "" });
    setShowAddForm(false);
    Alert.alert("Success", "Emergency contact added successfully");
  };

  const handleDeleteContact = (contactId: string, contactName: string) => {
    Alert.alert(
      "Delete Contact",
      `Are you sure you want to remove ${contactName} from your emergency contacts?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setContacts(contacts.filter((contact) => contact.id !== contactId));
            Alert.alert("Success", "Emergency contact removed");
          },
        },
      ],
    );
  };

  const handleCallContact = (phone: string, name: string) => {
    Alert.alert("Call Emergency Contact", `Calling ${name} at ${phone}...`);
  };

  const handleSOS = () => {
    Alert.alert(
      "Emergency SOS",
      "This will send your current location and trip details to all your emergency contacts. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send SOS",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "SOS Sent!",
              "Your emergency contacts have been notified with your current location and trip details.",
              [{ text: "OK" }],
            );
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-general-500">
      {/* Header */}
      <View className="bg-white p-5">
        <Text className="text-xl font-JakartaBold">Emergency Contacts</Text>
        <Text className="text-secondary-600 mt-1">
          Keep trusted contacts for safety emergencies
        </Text>
      </View>

      <ScrollView className="flex-1 px-5">
        {/* SOS Button */}
        <TouchableOpacity
          onPress={handleSOS}
          className="bg-danger-500 rounded-lg p-6 mb-6 items-center"
        >
          <Text className="text-4xl mb-2">🚨</Text>
          <Text className="text-white text-xl font-JakartaExtraBold mb-1">
            EMERGENCY SOS
          </Text>
          <Text className="text-white/90 text-center">
            Send your location to all emergency contacts
          </Text>
        </TouchableOpacity>

        {/* Emergency Contacts List */}
        <View className="bg-white rounded-lg p-4 mb-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-JakartaBold">
              Your Emergency Contacts
            </Text>
            <TouchableOpacity
              onPress={() => setShowAddForm(!showAddForm)}
              className="bg-primary-500 rounded-full px-4 py-2"
            >
              <Text className="text-white font-JakartaBold">
                {showAddForm ? "Cancel" : "+ Add"}
              </Text>
            </TouchableOpacity>
          </View>

          {contacts.length === 0 && !showAddForm ? (
            <View className="py-8 items-center">
              <Text className="text-4xl mb-3">📞</Text>
              <Text className="text-secondary-600 text-center mb-4">
                No emergency contacts yet
              </Text>
              <TouchableOpacity
                onPress={() => setShowAddForm(true)}
                className="bg-primary-500 rounded-full px-6 py-3"
              >
                <Text className="text-white font-JakartaBold">
                  Add First Contact
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            contacts.map((contact) => (
              <View
                key={contact.id}
                className="flex-row items-center py-3 border-b border-general-500 last:border-b-0"
              >
                <View className="flex-1">
                  <Text className="font-JakartaBold text-lg">
                    {contact.name}
                  </Text>
                  <Text className="text-secondary-600">{contact.phone}</Text>
                  <Text className="text-secondary-600 text-sm">
                    {contact.relationship}
                  </Text>
                </View>
                <View className="flex-row space-x-2">
                  <TouchableOpacity
                    onPress={() =>
                      handleCallContact(contact.phone, contact.name)
                    }
                    className="bg-success-500 rounded-full p-2"
                  >
                    <Text className="text-white font-JakartaBold">📞</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      handleDeleteContact(contact.id, contact.name)
                    }
                    className="bg-danger-500 rounded-full p-2"
                  >
                    <Text className="text-white font-JakartaBold">🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Add Contact Form */}
        {showAddForm && (
          <View className="bg-white rounded-lg p-4 mb-6">
            <Text className="text-lg font-JakartaBold mb-3">
              Add Emergency Contact
            </Text>

            <View className="space-y-3">
              <View>
                <Text className="font-JakartaMedium mb-2">Full Name *</Text>
                <TextInput
                  value={newContact.name}
                  onChangeText={(text) =>
                    setNewContact({ ...newContact, name: text })
                  }
                  placeholder="Enter full name"
                  className="border border-general-500 rounded-lg p-3 font-JakartaMedium"
                />
              </View>

              <View>
                <Text className="font-JakartaMedium mb-2">Phone Number *</Text>
                <TextInput
                  value={newContact.phone}
                  onChangeText={(text) =>
                    setNewContact({ ...newContact, phone: text })
                  }
                  placeholder="+1 (555) 123-4567"
                  keyboardType="phone-pad"
                  className="border border-general-500 rounded-lg p-3 font-JakartaMedium"
                />
              </View>

              <View>
                <Text className="font-JakartaMedium mb-2">Relationship</Text>
                <TextInput
                  value={newContact.relationship}
                  onChangeText={(text) =>
                    setNewContact({ ...newContact, relationship: text })
                  }
                  placeholder="e.g., Family, Friend, Spouse"
                  className="border border-general-500 rounded-lg p-3 font-JakartaMedium"
                />
              </View>

              <TouchableOpacity
                onPress={handleAddContact}
                className="bg-primary-500 rounded-full py-3 mt-4"
              >
                <Text className="text-white font-JakartaBold text-center">
                  Add Contact
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Safety Tips */}
        <View className="bg-white rounded-lg p-4 mb-8">
          <Text className="text-lg font-JakartaBold mb-3">Safety Tips</Text>

          <View className="space-y-3">
            <View className="flex-row items-start">
              <Text className="text-primary-500 mr-3 mt-1">•</Text>
              <Text className="text-secondary-600 flex-1">
                Keep your emergency contacts updated with current information
              </Text>
            </View>
            <View className="flex-row items-start">
              <Text className="text-primary-500 mr-3 mt-1">•</Text>
              <Text className="text-secondary-600 flex-1">
                Use the SOS feature only in genuine emergencies
              </Text>
            </View>
            <View className="flex-row items-start">
              <Text className="text-primary-500 mr-3 mt-1">•</Text>
              <Text className="text-secondary-600 flex-1">
                Your location is shared securely with emergency contacts
              </Text>
            </View>
            <View className="flex-row items-start">
              <Text className="text-primary-500 mr-3 mt-1">•</Text>
              <Text className="text-secondary-600 flex-1">
                Emergency contacts will receive your trip details and live
                location
              </Text>
            </View>
          </View>
        </View>

        {/* Emergency Info */}
        <View className="bg-warning-50 border border-warning-200 rounded-lg p-4 mb-8">
          <View className="flex-row items-center mb-2">
            <Text className="text-2xl mr-2">ℹ️</Text>
            <Text className="font-JakartaBold text-warning-700">
              Emergency Information
            </Text>
          </View>
          <Text className="text-warning-700 text-sm">
            In case of emergency, your location, trip details, and contact
            information will be shared with your emergency contacts. This
            feature is designed to keep you safe during your trips.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EmergencyContacts;
