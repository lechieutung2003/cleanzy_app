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
} from 'react-native';

const { height, width } = Dimensions.get('window');

export default function PolicyScreen({ navigation }: any) {
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
            <Text style={styles.title}>Privacy Policy</Text>
            
            {/* Last Updated */}
            <Text style={styles.lastUpdated}>Last updated: 31/10/2003</Text>

            {/* Content */}
            <View style={styles.contentContainer}>
              {/* Introduction */}
              <Text style={styles.paragraph}>
                Welcome to <Text style={styles.bold}>Cleanzy</Text>.
              </Text>
              <Text style={styles.paragraph}>
                Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your personal information when you use our app and services.
              </Text>

              {/* Section 1 */}
              <Text style={styles.sectionTitle}>1. Information We Collect</Text>
              <Text style={styles.paragraph}>
                We may collect the following types of information:
              </Text>
              <Text style={styles.bulletPoint}>• Personal details (name, phone number, email, address)</Text>
              <Text style={styles.bulletPoint}>• Account credentials (for login and verification)</Text>
              <Text style={styles.bulletPoint}>• Payment information (processed securely through third-party gateways)</Text>
              <Text style={styles.bulletPoint}>• Usage data (service history, preferences, app interactions)</Text>

              {/* Section 2 */}
              <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
              <Text style={styles.paragraph}>We use your data to:</Text>
              <Text style={styles.bulletPoint}>• Provide and manage cleaning services</Text>
              <Text style={styles.bulletPoint}>• Process payments and send receipts</Text>
              <Text style={styles.bulletPoint}>• Improve user experience and app performance</Text>
              <Text style={styles.bulletPoint}>• Send notifications, offers, and updates (if you agree)</Text>

              {/* Section 3 */}
              <Text style={styles.sectionTitle}>3. Data Protection</Text>
              <Text style={styles.paragraph}>
                We apply strict security measures to protect your information from unauthorized access, alteration, or disclosure. Your data is stored securely and only used for the purposes mentioned above.
              </Text>

              {/* Section 4 */}
              <Text style={styles.sectionTitle}>4. Sharing Information</Text>
              <Text style={styles.paragraph}>We may share limited information with:</Text>
              <Text style={styles.bulletPoint}>• Service providers (for booking and payment processing)</Text>
              <Text style={styles.bulletPoint}>• Authorities when required by law</Text>
              <Text style={styles.paragraph}>We never sell or trade your personal data.</Text>

              {/* Section 5 */}
              <Text style={styles.sectionTitle}>5. Your Rights</Text>
              <Text style={styles.paragraph}>You can:</Text>
              <Text style={styles.bulletPoint}>• View and edit your personal data</Text>
              <Text style={styles.bulletPoint}>• Request data deletion</Text>
              <Text style={styles.bulletPoint}>• Withdraw consent for marketing communications</Text>
              <Text style={styles.paragraph}>
                Contact us at <Text style={styles.link}>support@cleanzy.com</Text> for any privacy-related requests.
              </Text>

              {/* Section 6 */}
              <Text style={styles.sectionTitle}>6. Changes to This Policy</Text>
              <Text style={styles.paragraph}>
                We may update this Privacy Policy from time to time. We encourage you to review it periodically to stay informed about how we protect your information.
              </Text>
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
    marginTop: height * 0.02,
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
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#047857',
    marginTop: 16,
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
    marginLeft: 8,
    marginBottom: 4,
  },
  link: {
    color: '#047857',
    textDecorationLine: 'underline',
  },
});