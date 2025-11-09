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

export default function TermOfUseScreen({ navigation }: any) {
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
            <Text style={styles.title}>Terms of Use</Text>
            {/* Last Updated */}
            <Text style={styles.lastUpdated}>Last updated: 31/10/2003</Text>

            {/* Content */}
            <View style={styles.contentContainer}>
              {/* Introduction */}
              <Text style={styles.paragraph}>
                Welcome to <Text style={styles.bold}>Cleanzy</Text>. By using our app and services, you agree to the following terms and conditions. Please read them carefully.
              </Text>

              {/* Section 1 */}
              <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
              <Text style={styles.paragraph}>
                By accessing or using the Cleanzy app, you agree to be bound by these Terms of Use. If you do not agree, please stop using the app.
              </Text>

              {/* Section 2 */}
              <Text style={styles.sectionTitle}>2. Services Provided</Text>
              <Text style={styles.paragraph}>
                Cleanzy connects users with professional cleaning service providers. All bookings, prices, and schedules are managed through the app.
              </Text>

              {/* Section 3 */}
              <Text style={styles.sectionTitle}>3. User Responsibilities</Text>
              <Text style={styles.paragraph}>You agree to:</Text>
              <Text style={styles.bulletPoint}>• Provide accurate personal and payment information</Text>
              <Text style={styles.bulletPoint}>• Use the service for lawful purposes only</Text>
              <Text style={styles.bulletPoint}>• Not misuse, copy, or modify the app's content or system</Text>

              {/* Section 4 */}
              <Text style={styles.sectionTitle}>4. Payments and Refunds</Text>
              <Text style={styles.paragraph}>
                All payments must be completed through the app's secure payment system. Refunds or reschedules are subject to Cleanzy's cancellation policy.
              </Text>

              {/* Section 5 */}
              <Text style={styles.sectionTitle}>5. Service Providers</Text>
              <Text style={styles.paragraph}>
                Cleanzy works with verified and trained cleaners. However, Cleanzy is not directly responsible for any personal loss or property damage caused by third-party providers. We encourage users to report any issues immediately through the app.
              </Text>

              {/* Section 6 */}
              <Text style={styles.sectionTitle}>6. Account Termination</Text>
              <Text style={styles.paragraph}>
                Cleanzy reserves the right to suspend or terminate accounts that violate our policies or misuse the platform.
              </Text>

              {/* Section 7 */}
              <Text style={styles.sectionTitle}>7. Limitation of Liability</Text>
              <Text style={styles.paragraph}>
                Cleanzy is not liable for indirect damages, data loss, or service interruptions caused by external factors.
              </Text>

              {/* Section 8 */}
              <Text style={styles.sectionTitle}>8. Privacy and Data</Text>
              <Text style={styles.paragraph}>
                Your use of the app is also governed by our Privacy Policy, which describes how we collect and handle personal data.
              </Text>

              {/* Section 9 */}
              <Text style={styles.sectionTitle}>9. Changes to Terms</Text>
              <Text style={styles.paragraph}>
                Cleanzy may update these Terms from time to time. Continued use of the app means you accept the updated terms.
              </Text>

              {/* Section 10 */}
              <Text style={styles.sectionTitle}>10. Contact Us</Text>
              <Text style={styles.paragraph}>
                If you have any questions about these Terms, please contact us at:
              </Text>
              <Text style={styles.paragraph}>
                📧 <Text style={styles.link}>support@cleanzy.com</Text>
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
  lastUpdated: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 32,
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