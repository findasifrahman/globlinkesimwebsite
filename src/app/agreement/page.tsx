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
  marginBottom: theme.spacing(4),
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
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

export default function AgreementPage() {
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
            Terms of Service
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
            Last Updated: March 6, 2025
          </Typography>
        </Container>
      </Box>
      
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <StyledPaper>
          <SectionText>
            These Terms of Service (&quot;Terms&quot;) govern your access to and use of the Globlink website, mobile applications, and services (&quot;Services&quot;). By accessing or using our Services, you agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use our Services.
          </SectionText>
          
          <SectionTitle variant="h5">1. General Validity</SectionTitle>
          <SectionText>
            1.1 These Terms of Service (hereinafter "Terms") constitute a legally binding agreement between you (the "User" or "Customer") and Globlink.
          </SectionText>
          <SectionText>
            1.2 Prior to registering, purchasing, downloading, or using Globlink services, you must read, understand, and accept these Terms in their entirety.
          </SectionText>
          <SectionText>
            1.3 If you do not agree to these Terms, you are not authorized to use any services provided by Globlink.
          </SectionText>
          
          <SectionTitle variant="h5">2. Description of Services</SectionTitle>
          <SectionText>
            2.1 Use of Services
          </SectionText>
          <SectionText>
            <strong>Globlink</strong> provides convenient and efficient cross-border communication solutions for users worldwide. In multiple countries and regions, we offer flexible data, voice, and SMS plans for frequent international travelers and business users. Users can instantly select, purchase, and activate eSIM plans covering locations worldwide through devices that support eSIM on the <strong>Globlink</strong> platform. Users can register, purchase, and manage eSIMs via esim.globlink.com or the <strong>Globlink</strong> App. Payment services are supported by <strong>Apple Pay, Stripe, PayPal</strong>, and <strong>Alipay</strong>, ensuring secure transactions.
          </SectionText>
          <SectionText>
            2.2 User Registration and Information Provision
          </SectionText>
          <SectionText>
            Registered users must accept these Terms. During registration, the following information must be provided:
          </SectionText>
          <SectionText>
            – Nickname
          </SectionText>
          <SectionText>
            – Email address
          </SectionText>
          <SectionText>
            2.3 User Responsibilities
          </SectionText>
          <SectionText>
            When using Globlink services, users must comply with all applicable laws, regulations, and these Terms.
          </SectionText>
          <SectionText>
            Users must not engage in any of the following:
          </SectionText>
          <SectionText>
            – Any form of abuse, illegal activity, or fraudulent behavior;
          </SectionText>
          <SectionText>
            – Any action that may impair or interfere with the normal operation of Globlink's network.
          </SectionText>
          <SectionText>
            If a user violates the above, Intricate Lab reserves the right to suspend or terminate the service without further notice, and during the suspension, the user shall remain responsible for all related fees.
          </SectionText>
          
          <SectionTitle variant="h5">3. Formation, Duration, and Termination of the Contract</SectionTitle>
          <SectionText>
            The contract is established when a user places an order to purchase an eSIM via esim.globlink.com or the Globlink App. The contract will automatically terminate when the validity period of the purchased eSIM plan expires.
          </SectionText>
          <SectionText>
            If the user violates these Terms or is found engaging in fraudulent or abusive behavior, Globlink reserves the right to unilaterally terminate the contract and cancel the related services.
          </SectionText>
          
          <SectionTitle variant="h5">4. Fees and Payment</SectionTitle>
          <SectionText>
            4.1 Payment Terms
          </SectionText>
          <SectionText>
            Globlink supports payment methods including credit cards, Alipay.
          </SectionText>
          <SectionText>
            All transactions are settled in US dollars (USD). Payment transactions are processed and secured by platforms such as PAYSSION and Alipay.
          </SectionText>
          <SectionText>
            4.2 Usage Fees
          </SectionText>
          <SectionText>
            Unless otherwise stated, all fees charged by Globlink include Value-Added Tax (VAT).
          </SectionText>
          <SectionText>
            If the user has any reasonable and bona fide dispute regarding the total or partial charges on the invoice, such disputes must be raised within 10 days after receipt of the invoice, specifying the disputed amount and the reasons thereof.
          </SectionText>
          <SectionText>
            Users shall not offset their claims against Globlink's claims unless a court has made a final ruling or Globlink has expressly agreed without objection.
          </SectionText>
          <SectionText>
            4.3 eSIM Delivery
          </SectionText>
          <SectionText>
            The purchased eSIM will be immediately displayed on the "My eSIM" page in the user's account, and users are expected to activate it promptly.
          </SectionText>
          <SectionText>
            4.4 Globlink Credit
          </SectionText>
          <SectionText>
            <strong>Definition:</strong> Globlink Credit refers to the virtual currency held in the wallet of registered user accounts, which can be directly used to purchase packages or services.
          </SectionText>
          <SectionText>
            <strong>Recharge Methods:</strong> Users may increase their Credit balance through credit card transactions or by participating in designated activities.
          </SectionText>
          <SectionText>
            <strong>Usage Rules:</strong> Any participation in Globlink Credit activities (including promotional experiences and referral activities) must not undermine the fairness, integrity, or lawful operation of the program. Globlink reserves the right to cancel a user's eligibility to participate in the program or to use Globlink services if abuse is detected.
          </SectionText>
          <SectionText>
            <strong>Non-Refundable & Non-Exchangeable:</strong> Globlink Credit balances are non-refundable, cannot be exchanged for cash, and may not be used in conjunction with discount vouchers.
          </SectionText>
          
          <SectionTitle variant="h5">5. Refund, Cancellation, and Modification Policy</SectionTitle>
          <SectionText>
            5.1 Refund/Replacement for Service Anomalies
          </SectionText>
          <SectionText>
            If, due to a technical issue on the part of Globlink, the eSIM cannot be activated or used normally, the user is entitled to request a refund or a replacement eSIM.
          </SectionText>
          <SectionText>
            Refund requests must be submitted within 30 days of the purchase date.
          </SectionText>
          <SectionText>
            Users agree to cooperate with Globlink to resolve the issue by providing device screenshots, error messages, or other relevant evidence as needed. Should the user fail or refuse to cooperate, Globlink shall not be liable to issue a refund.
          </SectionText>
          <SectionText>
            5.2 Package Validity
          </SectionText>
          <SectionText>
            Each plan has a clearly defined validity period; once expired, any unused data, SMS, or call minutes will not be refunded or transferred.
          </SectionText>
          <SectionText>
            5.3 Special Circumstances
          </SectionText>
          <SectionText>
            <strong>Exclusion of Compensation:</strong> Globlink is not liable for any fees arising from secondary devices, backup SIM cards, alternative suppliers, hotel telephones, or any charges that are not directly related to the Globlink eSIM account.
          </SectionText>
          <SectionText>
            <strong>Fraudulent Purchases:</strong> In cases where there is evidence of abuse, violation of these Terms, or any fraudulent behavior, Globlink reserves the right to refuse any refund.
          </SectionText>
          <SectionText>
            <strong>Unauthorized Purchases:</strong> If any unauthorized purchase is suspected, the user must immediately notify Globlink; during the investigation, Globlink reserves the right to suspend the affected account.
          </SectionText>
          <SectionText>
            <strong>Accidental Purchases:</strong> Once the eSIM has been activated, it is deemed as used, and refunds will not be provided unless otherwise explicitly stated.
          </SectionText>
          <SectionText>
            <strong>Incorrect Charges:</strong> If the user has a reasonable dispute regarding any charges, such disputes must be submitted in writing to Globlink within 10 days of the charge, along with a detailed explanation.
          </SectionText>
          
          <SectionTitle variant="h5">6. Privacy Policy</SectionTitle>
          <SectionText>
            Globlink strictly protects user data, and all user information is used solely for the performance of the contract, service provision, and product-related notifications. Users agree to receive marketing emails from Globlink in accordance with our Privacy Policy; if a user wishes to unsubscribe, they may notify Globlink in writing.
          </SectionText>
          
          <SectionTitle variant="h5">7. Disclaimer</SectionTitle>
          <SectionText>
            Globlink shall not be liable for the following circumstances:
          </SectionText>
          <SectionText>
            Data transmission interruptions caused by equipment or network failures of telecommunications operators;
          </SectionText>
          <SectionText>
            Service interruptions caused by force majeure events such as natural disasters, wars, or terrorist attacks;
          </SectionText>
          <SectionText>
            System failures caused by hacker attacks or malicious software;
          </SectionText>
          <SectionText>
            Connection failures due to user device malfunctions or misconfigurations;
          </SectionText>
          <SectionText>
            Issues caused by insufficient signal coverage (e.g., in remote areas, underground, tunnels, at sea, etc.).
          </SectionText>
          
          <SectionTitle variant="h5">8. Service Management and Fair Usage Policy</SectionTitle>
          <SectionText>
            If a user engages in abuse or exhibits abnormal data consumption that adversely affects the normal usage of other users, Globlink reserves the right to impose usage restrictions.
          </SectionText>
          <SectionText>
            Users are prohibited from renting, reselling, modifying Globlink services, or engaging in reverse engineering or cracking activities.
          </SectionText>
          <SectionText>
            If fraudulent activities such as fake orders or scams are detected, Globlink reserves the right to clear the account balance, restrict, or disable the account, and pursue legal remedies.
          </SectionText>
          
          <SectionTitle variant="h5">9. Liability and Warranties</SectionTitle>
          <SectionText>
            Globlink does not guarantee continuous network availability and shall not be liable for any direct or indirect losses arising from network unavailability.
          </SectionText>
          <SectionText>
            Users assume all risks arising from device compatibility issues, operational errors, and other factors; Globlink shall not be responsible for such risks.
          </SectionText>
          
          <SectionTitle variant="h5">10. Acceptable Use and Prohibited Activities</SectionTitle>
          <SectionText>
            10.1 Compliance with Laws
          </SectionText>
          <SectionText>
            You are solely responsible for complying with all applicable laws in connection with your use of Globlink's services, regardless of the purpose of such use. In addition, you must adhere to the terms set forth in this Acceptable Use and Prohibited Activities clause.
          </SectionText>
          <SectionText>
            10.2 Prohibited Activities
          </SectionText>
          <SectionText>
            You are prohibited from using Globlink's services for any activities that:
          </SectionText>
          <SectionText>
            (a) violate any law, statute, ordinance, or regulation;
          </SectionText>
          <SectionText>
            (b) involve activities including, but not limited to:
          </SectionText>
          <SectionText>
            – Fraud or harassment schemes, such as pyramid or Ponzi schemes, matrix programs, "get rich quick" schemes, or certain multi-level marketing programs;
          </SectionText>
          <SectionText>
            – Infringement of any copyright, trademark, right of publicity, privacy, or any other proprietary right under the laws of any jurisdiction;
          </SectionText>
          <SectionText>
            – Promotion of hate, violence, or any form of intolerance that is discriminatory, or financial exploitation of criminal activities;
          </SectionText>
          <SectionText>
            – Distribution or facilitation of certain sexually oriented materials or services;
          </SectionText>
          <SectionText>
            – Any activities identified by governmental agencies as having a high likelihood of being fraudulent or illegal;
          </SectionText>
          <SectionText>
            (c) transfer, lease, or sell, in whole or in part, Globlink's services without prior authorization from Globlink;
          </SectionText>
          <SectionText>
            (d) engage in any actions that may adversely affect the interests of Globlink.
          </SectionText>
          <SectionText>
            10.3 Consequences of Violation
          </SectionText>
          <SectionText>
            If we determine, at our sole discretion, that you have engaged in any of the prohibited activities or otherwise violated this clause, we may take any of the following actions to protect Globlink, its customers, and third parties, without incurring any liability:
          </SectionText>
          <SectionText>
            (a) Terminate this User Agreement, limit your Globlink account, and/or immediately close or suspend your Globlink account;
          </SectionText>
          <SectionText>
            (b) Refuse to provide Globlink services to you now or in the future;
          </SectionText>
          <SectionText>
            (c) Limit your access to our websites, software, and systems (including any networks and servers used to provide our services) operated by us or on our behalf;
          </SectionText>
          <SectionText>
            (d) Initiate legal action against you;
          </SectionText>
          <SectionText>
            (e) Disclose your information as required by judgments or orders affecting you, including those issued by courts in Singapore or elsewhere directed to Globlink or its affiliates;
          </SectionText>
          <SectionText>
            (f) Cooperate with courts, government authorities, and regulatory agencies in any investigation concerning your activities;
          </SectionText>
          <SectionText>
            (g) Hold you liable for any damages incurred by Globlink as a result of your violation of these Terms, including (but not limited to) internal administrative costs, damage to Globlink's brand and reputation, and penalties imposed upon Globlink;
          </SectionText>
          <SectionText>
            (h) Hold you responsible for all claims, fees, fines, penalties, and other liabilities incurred by Globlink, any Globlink customer, or any third party arising out of your breach of these Terms or your use of Globlink's services.
          </SectionText>
          
          <SectionTitle variant="h5">11. Governing Law and Dispute Resolution</SectionTitle>
          <SectionText>
            These Terms shall be governed by the laws of Singapore.
          </SectionText>
          <SectionText>
            Any disputes arising out of or in connection with these Terms or Globlink services shall first be attempted to be resolved through friendly consultation; if consultation fails, the dispute shall be submitted to the Singapore International Arbitration Centre (SIAC) for arbitration.
          </SectionText>
          
          <SectionTitle variant="h5">12. Amendments and Notices</SectionTitle>
          <SectionText>
            Globlink reserves the right to modify, supplement, or delete these Terms at any time. The modified Terms will be published on the official Globlink website or App and will take effect from the date of publication.
          </SectionText>
          <SectionText>
            Continued use of the services constitutes acceptance of the latest Terms.
          </SectionText>
          <SectionText>
            Any notices regarding these Terms shall be delivered by email or published on the website/App, and shall be deemed to have been duly given in accordance with applicable laws.
          </SectionText>
          
          <SectionTitle variant="h5">13. Contact Us</SectionTitle>
          <SectionText>
            If you have any questions about these Terms of Service or our services, please feel free to reach out by email at globlinksolution@gmail.com or by mail Intricate Lab, Dhaka, Bangladesh (8801715480878).
          </SectionText>
        </StyledPaper>
      </Container>
      
      <Footer />
    </main>
  );
} 