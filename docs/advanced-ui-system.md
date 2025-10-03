# Advanced UI System - Complete Guide

## 🎯 **Overview**

El sistema avanzado de UI proporciona una colección completa de componentes y utilidades para crear experiencias de usuario premium con feedback visual instantáneo.

## 📋 **Architecture Overview**

### **Core Components**

- **UIStore**: Gestión centralizada del estado de UI
- **UIWrapper**: Componente principal que renderiza todos los elementos de UI
- **useUI Hook**: Interface principal para interactuar con el sistema

### **Available UI Components**

- ✅ **Toast Notifications** - Notificaciones temporales
- ✅ **Bottom Sheets** - Paneles deslizables desde abajo
- ✅ **Advanced Modals** - Modales con acciones complejas
- ✅ **Advanced Snackbars** - Notificaciones posicionables
- ✅ **Loading States** - Estados de carga personalizables
- ✅ **Progress Indicators** - Barras y círculos de progreso
- ✅ **Global Loading** - Overlay de carga global

---

## 🚀 **Quick Start**

### **Basic Usage**

```typescript
import { useUI } from '@/components/UIWrapper';

const MyComponent = () => {
  const { showSuccess, showError, withUI } = useUI();

  const handleAction = async () => {
    const result = await withUI(
      async () => {
        // Your async operation
        return await apiCall();
      },
      {
        loadingMessage: "Processing...",
        successMessage: "Completed successfully!",
        errorTitle: "Operation Failed"
      }
    );
  };

  return (
    <TouchableOpacity onPress={handleAction}>
      <Text>Do Something</Text>
    </TouchableOpacity>
  );
};
```

---

## 🎨 **Toast Notifications**

### **Basic Toasts**

```typescript
const { showSuccess, showError, showInfo, showWarning } = useUI();

// Simple notifications
showSuccess("Success!", "Operation completed");
showError("Error", "Something went wrong");
showInfo("Info", "Here's some information");
showWarning("Warning", "Be careful!");
```

### **Advanced Toasts with Actions**

```typescript
showError(
  "Connection Failed",
  "Unable to connect to server",
  {
    label: "Retry",
    onPress: () => retryConnection(),
  },
  {
    position: "center",
    persistent: true,
    duration: 10000,
  },
);
```

### **Custom Toast Configuration**

```typescript
const { showAdvancedToast } = useUI();

showAdvancedToast({
  type: "success",
  title: "Upload Complete",
  message: "Your file has been uploaded successfully",
  position: "top",
  variant: "filled",
  duration: 5000,
  actions: [
    {
      label: "View File",
      onPress: () => openFile(),
      variant: "default",
    },
    {
      label: "Share",
      onPress: () => shareFile(),
      variant: "secondary",
    },
  ],
});
```

---

## 📱 **Bottom Sheets**

### **Basic Bottom Sheet**

```typescript
const { showBottomSheet } = useUI();

const sheetId = showBottomSheet({
  title: "Options",
  content: (
    <View className="py-4">
      <TouchableOpacity className="py-3">
        <Text>Option 1</Text>
      </TouchableOpacity>
      <TouchableOpacity className="py-3">
        <Text>Option 2</Text>
      </TouchableOpacity>
    </View>
  )
});
```

### **Advanced Bottom Sheet**

```typescript
showBottomSheet({
  title: "Select Payment Method",
  height: 'half',
  draggable: true,
  showHandle: true,
  backdropClose: true,
  content: (
    <ScrollView className="max-h-96">
      {/* Your content here */}
    </ScrollView>
  ),
  onClose: () => console.log('Sheet closed'),
  onOpen: () => console.log('Sheet opened')
});
```

---

## 🪟 **Advanced Modals**

### **Basic Modal**

```typescript
const { showModal } = useUI();

showModal({
  title: "Confirm Action",
  content: (
    <Text>Are you sure you want to proceed?</Text>
  ),
  actions: [
    {
      label: "Cancel",
      onPress: () => console.log('Cancelled'),
      variant: 'secondary'
    },
    {
      label: "Confirm",
      onPress: () => proceedWithAction(),
      variant: 'default'
    }
  ]
});
```

### **Confirmation Modal**

```typescript
showModal({
  title: "Delete Account",
  variant: 'destructive',
  content: (
    <Text>This action cannot be undone. Your data will be permanently deleted.</Text>
  ),
  actions: [
    {
      label: "Cancel",
      onPress: () => {},
      variant: 'secondary'
    },
    {
      label: "Delete Account",
      onPress: () => deleteAccount(),
      variant: 'destructive'
    }
  ]
});
```

### **Large Modal with Form**

```typescript
showModal({
  title: "Edit Profile",
  size: 'lg',
  content: (
    <View className="space-y-4">
      <InputField label="Name" placeholder="Enter your name" />
      <InputField label="Email" placeholder="Enter your email" />
      {/* More form fields */}
    </View>
  ),
  actions: [
    {
      label: "Cancel",
      onPress: () => {},
      variant: 'secondary'
    },
    {
      label: "Save Changes",
      onPress: () => saveProfile(),
      variant: 'default'
    }
  ]
});
```

---

## 🍿 **Advanced Snackbars**

### **Positioned Snackbars**

```typescript
const { showSnackbar } = useUI();

// Top positioned
showSnackbar({
  message: "File uploaded successfully",
  type: "success",
  position: "top",
  duration: 3000,
});

// Bottom positioned
showSnackbar({
  message: "Connection restored",
  type: "info",
  position: "bottom",
});

// Corner positioned
showSnackbar({
  message: "New message received",
  type: "info",
  position: "top-right",
  action: {
    label: "View",
    onPress: () => viewMessage(),
  },
});
```

---

## ⏳ **Loading States**

### **Different Loading Types**

```typescript
const { showLoadingState } = useUI();

// Spinner
showLoadingState({
  type: "spinner",
  message: "Loading...",
  size: "md",
  overlay: false,
});

// Dots animation
showLoadingState({
  type: "dots",
  message: "Processing...",
  size: "lg",
  overlay: true,
});

// Skeleton loader
showLoadingState({
  type: "skeleton",
  overlay: false,
});
```

### **Overlay Loading**

```typescript
showLoadingState({
  type: "spinner",
  message: "Please wait...",
  overlay: true, // Covers entire screen
  size: "lg",
});
```

---

## 📊 **Progress Indicators**

### **Linear Progress**

```typescript
const { showProgress } = useUI();

const progressId = showProgress({
  type: "linear",
  value: 0,
  max: 100,
  label: "Uploading file...",
  showPercentage: true,
  color: "#0286FF",
});

// Update progress
updateProgress(progressId, { value: 50, label: "Halfway there..." });
```

### **Circular Progress**

```typescript
showProgress({
  type: "circular",
  value: 75,
  size: "lg",
  label: "Processing...",
  showPercentage: true,
  color: "#22c55e",
});
```

### **Step Progress**

```typescript
showProgress({
  type: "steps",
  label: "Setup Progress",
  steps: [
    { label: "Account", completed: true, active: false },
    { label: "Profile", completed: true, active: false },
    { label: "Payment", completed: false, active: true },
    { label: "Complete", completed: false, active: false },
  ],
});
```

---

## 🎯 **Advanced Async Operations**

### **withUI - Automatic UI Management**

```typescript
const result = await withUI(
  async () => {
    // Your async operation
    const response = await fetch("/api/data");
    return response.json();
  },
  {
    loadingMessage: "Fetching data...",
    successMessage: "Data loaded successfully!",
    errorTitle: "Failed to load data",
    onSuccess: (data) => {
      console.log("Data:", data);
      // Handle success
    },
    onError: (error) => {
      console.error("Error:", error);
      // Handle error
    },
  },
);
```

### **withProgress - Operations with Progress**

```typescript
const result = await withProgress(
  async (updateProgress) => {
    // Operation with progress updates
    updateProgress(25, "Initializing...");
    await step1();

    updateProgress(50, "Processing...");
    await step2();

    updateProgress(75, "Finalizing...");
    await step3();

    updateProgress(100, "Complete!");
    return finalResult;
  },
  {
    initialMessage: "Starting process...",
    successMessage: "Process completed!",
    onSuccess: (result) => handleResult(result),
  },
);
```

---

## 🎨 **Advanced Examples**

### **File Upload with Progress**

```typescript
const uploadFile = async (file: File) => {
  const result = await withProgress(
    async (updateProgress) => {
      const formData = new FormData();
      formData.append("file", file);

      const xhr = new XMLHttpRequest();

      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            updateProgress(percent, `Uploading... ${percent}%`);
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status === 200) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error("Upload failed"));
          }
        });

        xhr.addEventListener("error", () => reject(new Error("Upload failed")));

        xhr.open("POST", "/api/upload");
        xhr.send(formData);
      });
    },
    {
      initialMessage: "Preparing upload...",
      successMessage: "File uploaded successfully!",
      onSuccess: (response) => {
        showSuccess("Upload Complete", `File uploaded to ${response.url}`);
      },
    },
  );
};
```

### **Multi-step Form with Progress**

```typescript
const submitMultiStepForm = async (formData: any) => {
  const result = await withProgress(
    async (updateProgress) => {
      // Step 1: Validation
      updateProgress(10, "Validating form...");
      await validateForm(formData);

      // Step 2: Upload images
      updateProgress(30, "Uploading images...");
      const imageUrls = await uploadImages(formData.images);

      // Step 3: Save data
      updateProgress(70, "Saving data...");
      const savedData = await saveFormData({ ...formData, imageUrls });

      // Step 4: Send notifications
      updateProgress(90, "Sending notifications...");
      await sendNotifications(savedData.id);

      updateProgress(100, "Complete!");
      return savedData;
    },
    {
      initialMessage: "Submitting form...",
      successMessage: "Form submitted successfully!",
      onSuccess: (data) => {
        router.push(`/success/${data.id}`);
      },
    },
  );
};
```

### **Real-time Data Sync**

```typescript
const syncData = async () => {
  const result = await withUI(
    async () => {
      // Show progress for sync operation
      const progressId = showProgress({
        type: "circular",
        value: 0,
        label: "Syncing data...",
        showPercentage: true,
      });

      try {
        // Sync operation with progress updates
        const data = await syncService.sync((progress, message) => {
          updateProgress(progressId, { value: progress, label: message });
        });

        hideProgress(progressId);
        return data;
      } catch (error) {
        hideProgress(progressId);
        throw error;
      }
    },
    {
      loadingMessage: "Preparing sync...",
      successMessage: "Data synchronized successfully!",
      errorTitle: "Sync Failed",
    },
  );
};
```

---

## 🎨 **Customization**

### **Custom Colors and Themes**

```typescript
// Custom progress color
showProgress({
  type: "linear",
  value: 75,
  color: "#ff6b6b", // Custom red color
  label: "Processing...",
});

// Custom loading color
showLoadingState({
  type: "spinner",
  color: "#4ecdc4", // Custom teal color
  size: "lg",
});
```

### **Custom Durations**

```typescript
showSuccess("Success!", "Operation completed", null, {
  duration: 10000, // 10 seconds instead of default 3
  persistent: false,
});
```

### **Custom Positioning**

```typescript
showSnackbar({
  message: "Custom positioned snackbar",
  position: "bottom-left",
  type: "info",
});
```

---

## 🔧 **Best Practices**

### **1. Consistent Messaging**

```typescript
// ✅ Good: Consistent language
showLoading("Loading your profile...");
showSuccess("Success", "Profile updated successfully!");

// ❌ Bad: Inconsistent language
showLoading("Fetching data...");
showSuccess("Done", "Your profile has been saved!");
```

### **2. Appropriate Loading Types**

```typescript
// ✅ Good: Match loading type to operation
// Quick operations
showLoading("Saving...");

// Long operations with progress
showProgress({ type: "linear", label: "Uploading file..." });

// Indeterminate operations
showLoadingState({ type: "dots", message: "Processing..." });
```

### **3. Error Handling**

```typescript
// ✅ Good: Provide actionable errors
showError("Upload Failed", "File size exceeds 10MB limit", {
  label: "Choose Smaller File",
  onPress: () => openFilePicker(),
});

// ❌ Bad: Generic errors
showError("Error", "Something went wrong");
```

### **4. Progress Updates**

```typescript
// ✅ Good: Meaningful progress updates
updateProgress(progressId, { value: 25, label: "Connecting..." });
updateProgress(progressId, { value: 50, label: "Downloading..." });
updateProgress(progressId, { value: 75, label: "Processing..." });
updateProgress(progressId, { value: 100, label: "Complete!" });

// ❌ Bad: Meaningless updates
updateProgress(progressId, { value: 37 });
```

---

## 🚀 **Integration Examples**

### **API Service Integration**

```typescript
// apiService.ts
import { useUI } from "@/components/UIWrapper";

export class ApiService {
  private ui = useUI();

  async getData(endpoint: string) {
    return this.ui.withUI(() => fetch(endpoint).then((r) => r.json()), {
      loadingMessage: "Loading data...",
      successMessage: "Data loaded!",
      errorTitle: "Failed to load data",
    });
  }

  async uploadFile(file: File) {
    return this.ui.withProgress(
      async (updateProgress) => {
        // Upload logic with progress
        return uploadService.upload(file, updateProgress);
      },
      {
        initialMessage: "Preparing upload...",
        successMessage: "File uploaded successfully!",
      },
    );
  }
}
```

### **Form Validation Integration**

```typescript
const validateAndSubmit = async (formData: any) => {
  const { withUI, showError } = useUI();

  // Client-side validation
  const errors = validateForm(formData);
  if (errors.length > 0) {
    showError("Validation Error", errors.join("\n"));
    return;
  }

  // Submit with UI feedback
  const result = await withUI(() => submitForm(formData), {
    loadingMessage: "Submitting form...",
    successMessage: "Form submitted successfully!",
    errorTitle: "Submission Failed",
  });

  if (result) {
    router.push("/success");
  }
};
```

---

## 🎉 **Complete System Features**

| Feature                    | Status   | Description                          |
| -------------------------- | -------- | ------------------------------------ |
| ✅ **Toast Notifications** | Complete | Basic + Advanced toasts with actions |
| ✅ **Bottom Sheets**       | Complete | Draggable sheets with custom content |
| ✅ **Advanced Modals**     | Complete | Modals with actions and variants     |
| ✅ **Advanced Snackbars**  | Complete | Positioned snackbars with actions    |
| ✅ **Loading States**      | Complete | Multiple loading types and styles    |
| ✅ **Progress Indicators** | Complete | Linear, circular, and step progress  |
| ✅ **Global Loading**      | Complete | Full-screen loading overlay          |
| ✅ **Async Wrappers**      | Complete | `withUI` and `withProgress` helpers  |
| ✅ **Custom Positioning**  | Complete | Flexible positioning system          |
| ✅ **Theme Support**       | Complete | Colors, variants, and customization  |
| ✅ **Animation System**    | Complete | Smooth enter/exit animations         |
| ✅ **Queue Management**    | Complete | Multiple UI elements management      |

---

## 🎯 **Usage in Your App**

### **Replace Alert with UI System**

```typescript
// Before
Alert.alert("Success", "Data saved!", [{ text: "OK", onPress: () => {} }]);

// After
showSuccess("Success", "Data saved!");
```

### **Replace Loading States**

```typescript
// Before
const [loading, setLoading] = useState(false);
// Manual loading management

// After
const { withUI } = useUI();
const result = await withUI(() => apiCall(), {
  loadingMessage: "Loading...",
  successMessage: "Loaded successfully!",
});
```

### **Replace Complex UI Logic**

```typescript
// Before: Complex state management
const [loading, setLoading] = useState(false);
const [progress, setProgress] = useState(0);
const [error, setError] = useState(null);

// After: Simple one-liner
const result = await withProgress(
  (updateProgress) => uploadFile(file, updateProgress),
  { successMessage: "Upload complete!" },
);
```

---

**¡El sistema avanzado de UI está completamente listo y proporciona una experiencia de usuario premium con feedback visual instantáneo y gestión automática de estados!** 🚀
