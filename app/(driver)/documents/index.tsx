import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Alert, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { Button, Card, TextField } from "@/components/ui";
import { useDriverProfileStore } from "@/store/driverProfile";
import { useUI } from "@/components/UIWrapper";
import { useDriverNavigation } from "@/hooks/useDriverNavigation";

interface DocumentFormData {
  type: string;
  number: string;
  expiryDate: string;
  issuingAuthority: string;
}

const DriverDocuments = () => {
  const {
    documents,
    isLoading,
    error,
    fetchDocuments,
    uploadDocument,
    updateDocumentStatus,
    deleteDocument,
  } = useDriverProfileStore();

  const { showError, showSuccess } = useUI();
  const { hasActiveRide, currentServiceType } = useDriverNavigation();

  const [isUploading, setIsUploading] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>("");

  const documentTypes = [
    { id: "license", name: "Driver's License", required: true, icon: "🪪" },
    { id: "insurance", name: "Vehicle Insurance", required: true, icon: "📋" },
    {
      id: "registration",
      name: "Vehicle Registration",
      required: true,
      icon: "📄",
    },
    {
      id: "background_check",
      name: "Background Check",
      required: false,
      icon: "🔍",
    },
    {
      id: "vehicle_photos",
      name: "Vehicle Photos",
      required: false,
      icon: "📷",
    },
  ];

  useEffect(() => {
    // Check if user has active ride
    if (hasActiveRide) {
      showError(
        "Action Not Available",
        `You cannot manage documents while on an active ${currentServiceType || "service"}. Please complete your current service first.`,
      );
      router.back();
      return;
    }

    // Fetch documents when component mounts
    fetchDocuments();
  }, [hasActiveRide, currentServiceType, fetchDocuments, showError]);

  useEffect(() => {
    if (error) {
      showError("Error", error);
    }
  }, [error, showError]);

  const getDocumentStatus = (type: string) => {
    const doc = documents.find((d) => d.type === type);
    return doc?.status || "missing";
  };

  const getDocumentByType = (type: string) => {
    return documents.find((d) => d.type === type);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "text-success-600";
      case "pending":
        return "text-warning-600";
      case "rejected":
        return "text-danger-600";
      default:
        return "text-secondary-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return "✅";
      case "pending":
        return "⏳";
      case "rejected":
        return "❌";
      default:
        return "❓";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <View className="bg-success-100 px-3 py-1 rounded-full">
            <Text className="text-success-700 text-xs font-JakartaBold">
              VERIFIED
            </Text>
          </View>
        );
      case "pending":
        return (
          <View className="bg-warning-100 px-3 py-1 rounded-full">
            <Text className="text-warning-700 text-xs font-JakartaBold">
              PENDING
            </Text>
          </View>
        );
      case "rejected":
        return (
          <View className="bg-danger-100 px-3 py-1 rounded-full">
            <Text className="text-danger-700 text-xs font-JakartaBold">
              REJECTED
            </Text>
          </View>
        );
      default:
        return (
          <View className="bg-secondary-100 px-3 py-1 rounded-full">
            <Text className="text-secondary-700 text-xs font-JakartaBold">
              MISSING
            </Text>
          </View>
        );
    }
  };

  const handleUploadDocument = async (type: string) => {
    // For now, show a placeholder alert
    Alert.alert(
      "Upload Document",
      `Upload functionality for ${documentTypes.find((dt) => dt.id === type)?.name} will be implemented soon.`,
      [{ text: "OK" }],
    );
  };

  const handleViewDocument = (documentId: string) => {
    // Navigate to document details
    router.push(`/documents/${documentId}` as any);
  };

  const handleDeleteDocument = async (documentId: string, type: string) => {
    const docName =
      documentTypes.find((dt) => dt.id === type)?.name || "Document";

    Alert.alert(
      "Delete Document",
      `Are you sure you want to delete this ${docName}? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDocument(documentId);
              showSuccess(
                "Document Deleted",
                `${docName} has been removed successfully`,
              );
            } catch (error) {
              
            }
          },
        },
      ],
    );
  };

  const getVerificationProgress = () => {
    const requiredDocs = documentTypes.filter((dt) => dt.required);
    const verifiedCount = requiredDocs.filter(
      (dt) => getDocumentStatus(dt.id) === "approved",
    ).length;
    return {
      completed: verifiedCount,
      total: requiredDocs.length,
      percentage: Math.round((verifiedCount / requiredDocs.length) * 100),
    };
  };

  const progress = getVerificationProgress();

  if (isLoading && documents.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-general-500 justify-center items-center">
        <Text className="text-lg">Loading documents...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-general-500">
      {/* Header */}
      <View className="bg-white p-5">
        <Text className="text-xl font-JakartaBold">Documents</Text>
        <Text className="text-secondary-600 mt-1">
          Manage your verification documents
        </Text>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <View className="py-6">
          {/* Verification Progress */}
          <Card className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-JakartaBold">
                Verification Status
              </Text>
              <Text className="text-secondary-600 font-JakartaMedium">
                {progress.completed}/{progress.total} Complete
              </Text>
            </View>

            {/* Progress Bar */}
            <View className="bg-secondary-200 rounded-full h-3 mb-4">
              <View
                className={`h-3 rounded-full ${
                  progress.percentage === 100
                    ? "bg-success-500"
                    : progress.percentage >= 50
                      ? "bg-warning-500"
                      : "bg-danger-500"
                }`}
                style={{ width: `${progress.percentage}%` }}
              />
            </View>

            <Text className="text-center font-JakartaMedium">
              {progress.percentage === 100
                ? "🎉 All required documents verified!"
                : `${progress.percentage}% of verification complete`}
            </Text>

            {progress.percentage < 100 && (
              <View className="bg-warning-50 border border-warning-200 rounded-lg p-4 mt-4">
                <Text className="text-warning-800 font-JakartaBold mb-1">
                  ⚠️ Verification Required
                </Text>
                <Text className="text-warning-700 text-sm">
                  Complete document verification to start accepting rides.
                </Text>
              </View>
            )}
          </Card>

          {/* Document List */}
          <View className="space-y-4">
            {documentTypes.map((docType) => {
              const status = getDocumentStatus(docType.id);
              const document = getDocumentByType(docType.id);

              return (
                <Card key={docType.id} className="mb-4">
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center flex-1">
                      <Text className="text-2xl mr-3">{docType.icon}</Text>
                      <View className="flex-1">
                        <Text className="font-JakartaBold text-base">
                          {docType.name}
                        </Text>
                        {docType.required && (
                          <Text className="text-danger-500 text-xs font-JakartaMedium">
                            Required
                          </Text>
                        )}
                      </View>
                    </View>
                    {getStatusBadge(status)}
                  </View>

                  {/* Document Details */}
                  {document && (
                    <View className="bg-secondary-50 rounded-lg p-3 mb-3">
                      <View className="flex-row justify-between mb-2">
                        <Text className="text-secondary-600 text-sm">
                          Document ID:
                        </Text>
                        <Text className="font-JakartaMedium text-sm">
                          {document.id}
                        </Text>
                      </View>

                      {document.expiresAt && (
                        <View className="flex-row justify-between mb-2">
                          <Text className="text-secondary-600 text-sm">
                            Expires:
                          </Text>
                          <Text className="font-JakartaMedium text-sm">
                            {new Date(document.expiresAt).toLocaleDateString()}
                          </Text>
                        </View>
                      )}

                      {document.uploadedAt && (
                        <View className="flex-row justify-between">
                          <Text className="text-secondary-600 text-sm">
                            Uploaded:
                          </Text>
                          <Text className="font-JakartaMedium text-sm">
                            {new Date(document.uploadedAt).toLocaleDateString()}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}

                  {/* Action Buttons */}
                  <View className="flex-row space-x-3">
                    {status === "missing" ? (
                      <Button
                        title="Upload"
                        onPress={() => handleUploadDocument(docType.id)}
                        className="flex-1"
                        variant="primary"
                      />
                    ) : (
                      <>
                        <Button
                          title="View"
                          onPress={() =>
                            document && handleViewDocument(document.id)
                          }
                          className="flex-1"
                          variant="outline"
                        />
                        <Button
                          title="Re-upload"
                          onPress={() => handleUploadDocument(docType.id)}
                          className="flex-1"
                          variant="secondary"
                        />
                        {!docType.required && (
                          <Button
                            title="Delete"
                            onPress={() =>
                              document &&
                              handleDeleteDocument(document.id, docType.id)
                            }
                            className="flex-1"
                            variant="danger"
                          />
                        )}
                      </>
                    )}
                  </View>

                  {/* Status Messages */}
                  {status === "rejected" && document?.rejectionReason && (
                    <View className="bg-danger-50 border border-danger-200 rounded-lg p-3 mt-3">
                      <Text className="text-danger-800 font-JakartaBold mb-1">
                        Rejection Reason
                      </Text>
                      <Text className="text-danger-700 text-sm">
                        {document.rejectionReason}
                      </Text>
                    </View>
                  )}

                  {status === "pending_review" && (
                    <View className="bg-warning-50 border border-warning-200 rounded-lg p-3 mt-3">
                      <Text className="text-warning-800 font-JakartaBold mb-1">
                        Under Review
                      </Text>
                      <Text className="text-warning-700 text-sm">
                        Your document is being reviewed. This usually takes 1-2
                        business days.
                      </Text>
                    </View>
                  )}
                </Card>
              );
            })}
          </View>

          {/* Help Section */}
          <Card className="mt-6">
            <Text className="text-lg font-JakartaBold mb-3">Need Help?</Text>

            <View className="space-y-3">
              <TouchableOpacity
                onPress={() => router.push("/(driver)/support" as any)}
                className="flex-row items-center justify-between py-3 border-b border-secondary-200"
              >
                <View className="flex-row items-center">
                  <Text className="text-lg mr-3">💬</Text>
                  <View>
                    <Text className="font-JakartaMedium">Contact Support</Text>
                    <Text className="text-secondary-600 text-sm">
                      Get help with document verification
                    </Text>
                  </View>
                </View>
                <Text className="text-secondary-400">→</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  Alert.alert(
                    "Document Requirements",
                    "Detailed requirements will be shown here",
                  )
                }
                className="flex-row items-center justify-between py-3"
              >
                <View className="flex-row items-center">
                  <Text className="text-lg mr-3">📋</Text>
                  <View>
                    <Text className="font-JakartaMedium">Requirements</Text>
                    <Text className="text-secondary-600 text-sm">
                      View document requirements
                    </Text>
                  </View>
                </View>
                <Text className="text-secondary-400">→</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DriverDocuments;
