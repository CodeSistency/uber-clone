import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { UserCardProps } from '@/types/wallet';

const UserCard: React.FC<UserCardProps> = ({ 
  user, 
  isVerified = false,
  className = '' 
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getAvatarColor = (email: string) => {
    const colors = [
      'bg-purple-500',
      'bg-green-500', 
      'bg-blue-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-indigo-500',
      'bg-pink-500',
      'bg-teal-500'
    ];
    
    // Use email hash for consistent color
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <TouchableOpacity 
      className={`bg-white rounded-xl p-4 shadow-sm border border-gray-100 ${className}`}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center">
        {/* Avatar */}
        <View className={`w-16 h-16 rounded-full ${getAvatarColor(user.email)} items-center justify-center mr-4`}>
          {user.avatar ? (
            <Text className="text-white text-xl">🖼️</Text>
          ) : (
            <Text className="text-white font-JakartaBold text-lg">
              {getInitials(user.name)}
            </Text>
          )}
        </View>

        {/* User Info */}
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <Text className="font-JakartaBold text-gray-800 text-lg mr-2">
              {user.name}
            </Text>
            {isVerified && (
              <View className="bg-success-100 rounded-full p-1">
                <Text className="text-success-500 text-xs">✓</Text>
              </View>
            )}
          </View>
          
          <Text className="font-JakartaMedium text-gray-500 text-sm mb-2">
            {user.email}
          </Text>
          
          <View className="flex-row items-center">
            <View className={`px-2 py-1 rounded-full ${
              isVerified ? 'bg-success-100' : 'bg-warning-100'
            }`}>
              <Text className={`text-xs font-JakartaMedium ${
                isVerified ? 'text-success-600' : 'text-warning-600'
              }`}>
                {isVerified ? 'Verified User' : 'Verifying...'}
              </Text>
            </View>
          </View>
        </View>

        {/* Status Icon */}
        <View className="ml-2">
          <Text className={`text-2xl ${isVerified ? 'text-success-500' : 'text-warning-500'}`}>
            {isVerified ? '✅' : '⏳'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default UserCard;








