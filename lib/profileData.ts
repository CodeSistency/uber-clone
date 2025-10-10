import { ProfileData } from '@/store/profile';

// Datos de ejemplo para inicializar el perfil
export const mockProfileData: ProfileData = {
  firstName: "María",
  lastName: "González",
  email: "maria.gonzalez@example.com",
  phone: "+584141234567",
  dateOfBirth: new Date("1985-03-15"),
  gender: "female",
  address: "Calle 123, Edificio ABC, Apartamento 4B",
  city: "Caracas",
  state: "Miranda",
  country: "venezuela",
  postalCode: "1010",
  preferredLanguage: "es",
  timezone: "America/Caracas",
  currency: "USD",
  theme: "auto",
  profileImage: null,
  savedAddresses: [
    {
      id: "addr_1",
      type: "home",
      name: "My Home",
      address: "Calle 123, Edificio ABC, Apartamento 4B, Caracas",
      coordinates: {
        latitude: 10.4806,
        longitude: -66.9036,
      },
      isDefault: true,
      createdAt: new Date("2024-01-15"),
    },
    {
      id: "addr_2",
      type: "work",
      name: "Office",
      address: "Av. Francisco de Miranda, Torre Empresarial, Piso 15, Caracas",
      coordinates: {
        latitude: 10.4900,
        longitude: -66.8900,
      },
      isDefault: false,
      createdAt: new Date("2024-01-20"),
    },
  ],
  verification: {
    emailVerified: true,
    phoneVerified: true,
    accountVerified: false,
    verificationStatus: "pending",
  },
};

// Función para inicializar el perfil con datos de ejemplo
export const initializeProfileWithMockData = () => {
  return mockProfileData;
};








