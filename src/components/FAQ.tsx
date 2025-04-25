import React from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  List,
  ListItem,
  ListItemIcon,
} from '@mui/material';
import { 
  ExpandMore,
  FiberManualRecord,
  CheckCircle,
  Info,
  Help,
  QuestionAnswer,
  TravelExplore,
  PhoneAndroid,
  Laptop,
  Public,
  Call,
  CalendarToday
} from '@mui/icons-material';

const faqItems = [
  {
    question: "How to get a Globlink eSIM?",
    answer: "Here's how you can smoothly get a Globlink eSIM:\n\n1. Confirm that your device is eSIM Compatible and Carrier Unlocked.\n2. Visit the Globlink website.\n3. Select and purchase eSIM data plans.\n4. Follow the installation instructions provided.\n5. Connect to a local network instantly :-)",
    icon: <TravelExplore />
  },
  {
    question: "Which scenarios are suitable for using eSIM?",
    answer: "If you have upcoming overseas travel plans, you can avoid the hassle of changing SIM cards and paying high roaming fees by using RedteaGO eSIM. If you frequently travel abroad for business, it's also recommended to use Globlink eSIM to work in a more secure network environment.",
    icon: <Public />
  },
  {
    question: "How can I check eSIM compatibility for my phone?",
    answer: "The easiest way to check if your phone is compatible with eSIM is to download a RedteaGO App. You will receive an \"eSIM Not Supported\" notification if your cell phone is not compatible with eSIM.\n\nTo check if your phone is CARRIER UNLOCK: Settings > General > About > Carrier Lock.\nYour phone is unlocked if it appears \"No SIM Restrictions\".\n\nYou can also check our eSIM Compatible Device List for further details",
    icon: <PhoneAndroid />
  },
  {
    question: "How can I check eSIM compatibility for my laptop?",
    answer: "To check if your laptop supports eSIMs, follow these steps:\nGo to Settings > Click Network & Internet > Select Cellular\nYou'll be able to see if your laptop supports eSIMs or not on this screen.",
    icon: <Laptop />
  },
  {
    question: "How to choose a Globlink eSIM data plan?",
    answer: "We offer both single-region and multi-region plans for your selection. Depending on your destination, you can make the following choices:\n\n• If you are traveling to a single country or region, a single-region plan would be most suitable.\n• If you plan to visit multiple countries within a continent, we recommend selecting a multi-region plan. Before purchasing, please ensure that the countries covered in the plan meet your needs.\n• If you will be traveling to countries or regions across multiple continents, a global plan would be a great choice.",
    icon: <Help />
  },
  {
    question: "Does Globlink eSIM come with calls & texts service?",
    answer: "Currently, Calls & Texts services are available for the following destinations:\n• Asia (11 areas)\n• European Union (27 countries)\n• Global (130+ areas)\n• United States\n• Indonesia\n\nPlease refer to the plan details for confirmation of the call minutes and SMS count.",
    icon: <Call />
  },
  {
    question: "When should I install my eSIM?",
    answer: "We recommend installing your eSIM on the day of departure, it allows you to get connected upon arrival at your destination. The activation process requires an internet connection, so please ensure that you have a stable internet service during activation.",
    icon: <CalendarToday />
  }
];

export default function FAQ() {
  const theme = useTheme();

  const formatAnswer = (answer: string) => {
    const lines = answer.split('\n');
    return lines.map((line, index) => {
      if (line.startsWith('•') || line.match(/^\d+\./)) {
        return (
          <ListItem key={index} sx={{ pl: 0 }}>
            <ListItemIcon sx={{ minWidth: 30 }}>
              <FiberManualRecord sx={{ fontSize: 8, color: theme.palette.primary.main }} />
            </ListItemIcon>
            <Typography 
              component="span" 
              sx={{ 
                fontWeight: 'bold',
                color: theme.palette.text.primary
              }}
            >
              {line.replace(/^\d+\.\s*|^•\s*/, '')}
            </Typography>
          </ListItem>
        );
      }
      return (
        <Typography 
          key={index} 
          sx={{ 
            mb: 1,
            fontWeight: 'bold',
            color: theme.palette.text.secondary
          }}
        >
          {line}
        </Typography>
      );
    });
  };

  return (
    <Box 
      id="faq"
      sx={{ 
        py: 8,
        bgcolor: theme.palette.background.default
      }}
    >
      <Box sx={{ maxWidth: 'lg', mx: 'auto', px: 2 }}>
        <Typography 
          variant="h4" 
          component="h2" 
          align="center" 
          gutterBottom
          sx={{ 
            fontWeight: 'bold',
            mb: 4,
            color: theme.palette.primary.main
          }}
        >
          Frequently Asked Questions
        </Typography>
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
          {faqItems.map((item, index) => (
            <Accordion 
              key={index}
              sx={{ 
                mb: 2,
                '&:before': { display: 'none' },
                boxShadow: 'none',
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                '&:hover': {
                  bgcolor: theme.palette.action.hover
                }
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMore />}
                sx={{
                  '& .MuiAccordionSummary-content': {
                    my: 1
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {item.icon}
                  <Typography 
                    sx={{ 
                      fontWeight: 600,
                      color: theme.palette.primary.main
                    }}
                  >
                    {item.question}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <List sx={{ py: 0 }}>
                  {formatAnswer(item.answer)}
                </List>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Box>
    </Box>
  );
} 