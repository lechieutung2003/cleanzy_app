import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  Dimensions,
  Image,
  StatusBar,
  Linking,
} from 'react-native';

const { height, width } = Dimensions.get('window');

export default function CustomerSupportScreen({ navigation }: any) {
  const handleCall = () => {
    Linking.openURL('tel:+841900686868');
  };

  const handleEmail = () => {
    Linking.openURL('mailto:support@cleanzy.com');
  };

  const handleAddress = () => {
    const address = '219-221 Han Thuyen Street, Hai Chau District, Da Nang City, Viet Nam';
    const encodedAddress = encodeURIComponent(address);
    Linking.openURL(`https://maps.google.com/?q=${encodedAddress}`);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#12603b" />
      
      {/* Background xanh đậm full screen */}
      <ImageBackground
        source={require('../../assets/background_profile.png')}
        style={styles.backgroundFull}
        resizeMode="cover"
      >
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Image
            source={require('../../assets/back_button_white.png')}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* Content Card với background xanh nhạt */}
        <ImageBackground
          source={require('../../assets/background_profile2.png')}
          style={styles.profileCard}
          resizeMode="cover"
          imageStyle={styles.profileCardImage}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Title */}
            <Text style={styles.title}>Customer Support</Text>

            {/* Content */}
            <View style={styles.contentContainer}>
              {/* Introduction */}
              <Text style={styles.paragraph}>
                We're here to help you!
              </Text>
              <Text style={styles.paragraph}>
                If you have any questions, feedback, or problems with our services, please contact our support team using one of the methods below.
              </Text>

              {/* Hotline Section */}
              <View style={styles.contactSection}>
                <Text style={styles.sectionTitle}>📞 Hotline</Text>
                <TouchableOpacity onPress={handleCall} activeOpacity={0.7}>
                  <Text style={styles.contactLink}>+84 1900 6868</Text>
                </TouchableOpacity>
                <Text style={styles.availabilityText}>
                  Available from 8:00 AM – 9:00 PM, Monday to Sunday.
                </Text>
              </View>

              {/* Email Section */}
              <View style={styles.contactSection}>
                <Text style={styles.sectionTitle}>📧 Email</Text>
                <TouchableOpacity onPress={handleEmail} activeOpacity={0.7}>
                  <Text style={styles.contactLink}>support@cleanzy.com</Text>
                </TouchableOpacity>
              </View>

              {/* Office Address Section */}
              <View style={styles.contactSection}>
                <Text style={styles.sectionTitle}>📍 Office Address</Text>
                <Text style={styles.paragraph}>
                  <Text style={styles.bold}>Cleanzy Service Co., Ltd.</Text>
                </Text>
                <TouchableOpacity onPress={handleAddress} activeOpacity={0.7}>
                  <Text style={styles.addressText}>
                    219–221 Han Thuyen Street, Hai Chau District, Da Nang City, Viet Nam
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Note Section */}
              <View style={styles.noteSection}>
                <Text style={styles.noteTitle}>💡 Note</Text>
                <Text style={styles.noteText}>
                  For urgent service issues (such as cleaner no-show or payment errors), please call the hotline directly for the fastest support.
                </Text>
              </View>
            </View>
          </ScrollView>
        </ImageBackground>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#12603b',
  },
  backgroundFull: {
    flex: 1,
    width: '100%',
    paddingTop: 16,
  },
  backButton: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
    marginTop: 8,
  },
  backIcon: {
    width: 58,
    height: 58,
  },
  profileCard: {
    flex: 1,
    marginTop: height * 0.03,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'visible',
    paddingTop: 40,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  profileCardImage: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#047857',
    textAlign: 'center',
    marginBottom: 32,
  },
  contentContainer: {
    gap: 16,
  },
  paragraph: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 8,
  },
  bold: {
    fontWeight: 'bold',
    color: '#047857',
  },
  contactSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#047857',
    marginBottom: 12,
  },
  contactLink: {
    fontSize: 18,
    fontWeight: '600',
    color: '#047857',
    textDecorationLine: 'underline',
    marginBottom: 8,
  },
  availabilityText: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: 4,
  },
  addressText: {
    fontSize: 15,
    color: '#047857',
    lineHeight: 22,
    textDecorationLine: 'underline',
  },
  noteSection: {
    backgroundColor: '#fef3c7',
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 8,
  },
  noteText: {
    fontSize: 15,
    color: '#78350f',
    lineHeight: 22,
  },
});
