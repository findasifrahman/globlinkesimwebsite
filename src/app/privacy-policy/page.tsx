'use client';

import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Divider,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.spacing(2),
  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)',
  marginBottom: theme.spacing(4),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  marginBottom: theme.spacing(2),
  color: theme.palette.primary.main,
}));

const SectionText = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  lineHeight: 1.7,
}));

export default function PrivacyPolicyPage() {
  const theme = useTheme();

  return (
    <main>
      <Navbar />
      
      {/* Hero Section */}
      <Box 
        sx={{ 
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          py: 6,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Privacy Policy
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
            Last Updated: March 6, 2025
          </Typography>
        </Container>
      </Box>
      
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <StyledPaper>
          <SectionText>
            Globlink recognizes the importance of your privacy. This privacy policy tells you what personal information we collect and how we use it. Globlink may change this privacy policy from time to time, in its sole discretion, as discussed in section '8. Changes to This Policy' below. By registering an account or otherwise using or visiting any Globlink website, application, product, software, tool, data feed, and/or service (collectively the "Service"), you understand and agree to the terms of this policy. Please read this policy carefully.
          </SectionText>
          
          <SectionText>
            If you have an unresolved privacy or data use concern that we have not addressed satisfactorily, please contact us directly at globlinksolution@gmail.com or find more information under section '6. How Does A User Change Or Update Information'.
          </SectionText>
          
          <SectionText>
            Globlink is committed to your privacy. This privacy notice explains how we collect, use, disclose, retain, and protect your personal information.
          </SectionText>
          
          <SectionText>
            A few key principles regarding GDPR; A clear purpose: the controller must specifically inform the customer of the use he will make of his personal data by collecting them. Relevant data: the controller must only collect data that is strictly necessary for his treatment; this is the principle of minimizing collection. The retention period: the personal data must be kept enough time to the controller to achieve its purpose; beyond that time, the data must be deleted. The rights of individuals: individuals can exercise their rights over the personal data held by the controller: access, rectification or deletion.
          </SectionText>
          
          <SectionTitle variant="h5">1. What Information Do We Collect?</SectionTitle>
          
          <SectionText variant="h6">1.1 Personally-Identifiable Information</SectionText>
          <SectionText>
            We may collect personally identifiable information when you specifically and knowingly provide it to us, for example when you sign up for our newsletter or chat, create an account, request more information on our contact us page, respond to a survey or questionnaire and provide personal information such as your email address, name, phone number or other information. Where applicable, personally identifiable information includes personal data as defined in applicable law.
          </SectionText>
          <SectionText>
            This Privacy Policy does not apply to the privacy practices of third parties that we do not own or control, including but not limited to any third-party websites, services, applications, online resources to which this Site may link or otherwise reference (collectively Third Party Services or TPS) that you may access through the Services. We take no responsibility for the content or privacy practices of any TPS. We encourage you to carefully review the privacy policies of any TPS you access.
          </SectionText>
          <SectionText>
            Globlink does not consider personally identifiable information to include information that has been anonymized so that it does not allow a third party to identify a specific individual. We collect and use your personally-identifiable information to provide the services, operate and improve our service, provide customer service, perform research and analysis aimed at improving our products, service and technology, and display content that is customized to your interests and preferences.
          </SectionText>
          <SectionText>
            You may always choose not to provide personally identifiable information, but if you choose so, certain parts of the Service may not be available to you. If you have registered an account with us, you will have agreed to provide your personally identifiable information in order to access the services. This consent provides us with the legal basis we require under applicable law to process your data. You maintain the right to withdraw such consent at any time. If you do not agree to our use of your personal data in line with this policy, please do not use our Services.
          </SectionText>
          
          <SectionText variant="h6">1.2 Sensitive Personal Data</SectionText>
          <SectionText>
            Subject to the following paragraph, we ask that you do not send us, and you do not disclose, any sensitive personal data (e.g., social security numbers, information related to racial or ethnic origin, political opinions, religion or other beliefs, health, biometrics or genetic characteristics, criminal background or trade union membership) on or through the services or otherwise to us.
          </SectionText>
          <SectionText>
            If you send or disclose any sensitive personal data to us when you submit content to the services, you consent to our processing and use of such sensitive personal data in accordance with this policy. If you do not consent to our processing and use of such sensitive personal data, you must not submit such content to us. Please note that even if these information are provided, we will not store them anywhere on our side.
          </SectionText>
          
          <SectionText variant="h6">1.3 Non-Personally-Identifiable Information</SectionText>
          <SectionText>
            We may collect and aggregate non-personally identifiable information which is information which does not permit you to be identified or identifiable either by itself or in combination with other information available to a third party. This information may include information such as a website that referred you to us, your IP address, browser type and language, hardware types, geographic location, and access times and durations. We also may collect navigational information, including information about the service content or pages you view, the links you click, and other actions taken in connection with the service. We use this information to analyze usage patterns as part of making improvements to the Service.
          </SectionText>
          
          <SectionTitle variant="h5">2. What Do We Do With The Information That We Collect?</SectionTitle>
          
          <SectionText variant="h6">2.1 Information that we collect</SectionText>
          <SectionText>
            Except as disclosed in this privacy policy, Globlink does not share your personal information with any outside parties.
          </SectionText>
          <SectionText>
            Globlink will use the personally identifiable information directly provided by you solely for the purpose for which you have provided it, which may include:
          </SectionText>
          <SectionText>
            • to operate, maintain, and improve the Services;
          </SectionText>
          <SectionText>
            • to manage your account, including to communicate with you regarding your account;
          </SectionText>
          <SectionText>
            • to operate and administer any promotions you participate in on any site or application;
          </SectionText>
          <SectionText>
            • to respond to your comments and questions and to provide customer service;
          </SectionText>
          <SectionText>
            • to send information including technical notices, updates, security alerts, and support and administrative messages;
          </SectionText>
          <SectionText>
            • with your consent, to send you marketing emails about upcoming promotions, and other news, including information about products and services offered by us and our affiliates.
          </SectionText>
          <SectionText>
            • to process payments you make via the Services; and
          </SectionText>
          <SectionText>
            • as we believe necessary or appropriate (a) to comply with applicable laws; (b) to comply with lawful requests and legal process, including to respond to requests from public and government authorities; (c) to enforce our Policy; and (d) to protect our rights, privacy, safety or property, and/or that of you or others.
          </SectionText>
          <SectionText>
            We may share this information with service providers who perform services on our behalf, such as those services listed above, or other services like processing information requests, displaying stored data you access, to assist us in marketing, to conduct audits, etc. Those companies will be permitted to obtain only the personal information they need to provide the service they provide, will be required to maintain the confidentiality of the information, and will be prohibited from using it for any other purpose.
          </SectionText>
          <SectionText>
            We retain information about your marketing preferences for a reasonable period of time from the date you last expressed interest in our content, products or services, such as when you last opened an email from us.
          </SectionText>
          <SectionText>
            We may also use information you provide to better serve you, and, if you have given your consent for us to do so, to send you email or text messages concerning offers from our partners and other third parties that we think may be of interest to you.
          </SectionText>
          <SectionText>
            We will only retain your personally identifiable information as long as reasonably required to provide you with the Services unless a longer retention period is required or permitted by law (for example, for regulatory purposes).
          </SectionText>
          <SectionText>
            You may contact us anytime to opt-out of: (i) direct marketing communications; (ii) our collection of sensitive personal data; (iii) any new processing of your personal data that we may carry out beyond the original purpose. Please note that your use of some of the Services may be ineffective upon opt-out. You may also: (A) access the data we hold about you at any time via your account or by contacting us directly; (B) update or correct any inaccuracies in your personal data by contacting us; (C) in certain situations, for example when the data we hold about you is no longer relevant or is incorrect, you can request that we erase your data. You may contact us at globlinksolution@gmail.com anytime for any other questions you may have about your personally identifiable information and our use of it.
          </SectionText>
          
          <SectionTitle variant="h5">3. Disclosure</SectionTitle>
          <SectionText>
            As a general rule, Globlink will not disclose any of your personally identifiable information except under one of the following circumstances:
          </SectionText>
          <SectionText>
            • we have your permission, including the permission granted by your acceptance of this Privacy Policy;
          </SectionText>
          <SectionText>
            • we determine in good faith that it is legally required to be revealed by any relevant statute, regulation, ordinance, rule, administrative or court order, decree, or subpoena;
          </SectionText>
          <SectionText>
            • it is information that we determine must be disclosed to correct what we believe to be false or misleading information or to address activities that we believe to be manipulative, deceptive or otherwise a violation of law;
          </SectionText>
          <SectionText>
            • where you are otherwise notified at the time we collect the data;
          </SectionText>
          <SectionText>
            • where we need to share your information to provide the product or service you have requested;
          </SectionText>
          <SectionText>
            • when such disclosure is made subject to confidentiality restrictions in connection with a sale, merger, transfer, exchange, or other disposition (whether of assets, stock, or otherwise) of all or a portion of the business conducted by Globlink.
          </SectionText>
          <SectionText>
            Globlink may share the non-personally identifiable information that Globlink gathers, in aggregate form only, with advertisers and other partners.
          </SectionText>
          
          <SectionTitle variant="h5">4. Children's Policy</SectionTitle>
          <SectionText>
            The Terms of service clearly provide that Users must be (i) 18 or older, or (ii) 13 and older if either (a) an emancipated minor, or (b) he/she possess legal parental or guardian consent. Globlink does not knowingly collect personally identifiable information from users under 13. In the event that we learn that we have collected any personal information from a user under the age of 13, we will attempt to identify and delete that information from our database.
          </SectionText>
          
          <SectionTitle variant="h5">5. International Usage</SectionTitle>
          <SectionText>
            The Service is owned by Globlink and may be accessed in Europe and abroad. For data protection purposes, Globlink is the controller and, unless otherwise noted, is also the processor of data. Information collected may be retained, and may be stored, processed, accessed, and used in jurisdictions whose privacy laws may be different and less protective than those of your home jurisdiction.
          </SectionText>
          <SectionText>
            Globlink has also contracted with third-party service providers to manage customer support for optimal service. Some data needs to be disclosed and transferred to this third party to ensure the fulfillment of the service. All third parties involved have been engaged under a binding confidentiality agreement and have limited access to the Globlink data for the purposes of providing support.
          </SectionText>
          
          <SectionTitle variant="h5">6. How Does A User Change Or Update Information?</SectionTitle>
          <SectionText>
            If you have any questions or concerns about this privacy policy or would like the personally identifiable information that you have provided to be removed from our files, please contact Globlink via email at globlinksolution@gmail.com.
          </SectionText>
          
          <SectionTitle variant="h5">7. Security and Encryption</SectionTitle>
          <SectionText>
            We follow generally accepted industry standards to help protect your personal information. No method of transmission over the internet, mobile technology, or method of electronic storage, is completely secure. Therefore, while we endeavor to maintain physical, electronic, and procedural safeguards to protect the confidentiality of the information that we collect online, we cannot guarantee its absolute security. Our service has security measures in place designed to protect against the loss, misuse and alteration of the information under our control. We use standard Secure Socket Layer (SSL) encryption that encodes information for such transmissions. All service information is maintained on secure servers. Access to stored data is protected by multi-layered security controls including firewalls, role-based access controls and passwords. You are responsible to keep your password secure. If you have reason to believe that your interaction with us is no longer secure (for example, if you feel that the security of any account you might have with us has been compromised), please immediately notify us of the problem by contacting us at globlinksolution@gmail.com.
          </SectionText>
          
          <SectionTitle variant="h5">8. Changes to This Policy</SectionTitle>
          <SectionText>
            We reserve the right to change the terms of this privacy policy at any time. When we make changes, we will revise the last updated date at the top of the policy. If there are material changes to this statement or in how we will use your personal information, we will notify you by prominently posting a notice of such changes here or on our home page, or by sending you an email. We encourage you to review this policy whenever you visit one of our websites or applications.
          </SectionText>
          
          <Box sx={{ mt: 4, textAlign: 'right' }}>
            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
              2025 Globlink team
            </Typography>
            <Typography variant="body2">
              All rights reserved.
            </Typography>
          </Box>
        </StyledPaper>
      </Container>
      
      <Footer />
    </main>
  );
} 