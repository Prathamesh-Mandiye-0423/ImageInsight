import { Box, Text, Flex, Link } from "@chakra-ui/react";

const Footer = () => {
  return (
    <Box marginTop={50}>
      <Flex justifyContent="center" alignItems="center" flexDirection="column">
        <Text fontSize="bold">Powered By Google Gemini.</Text>
        <Link
          href="https://www.linkedin.com/in/prathamesh-mandiye/"
          marginTop={2}
          fontSize="sm"
          textAlign="center"
          target="_blank"
          rel="noopener noreferrer"
        >
          Made by Prathamesh Mandiye.
        </Link>
      </Flex>
    </Box>
  );
};
export default Footer;
