import React, { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  ChakraProvider,
  Container,
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Input,
  Image,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Icon,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import imageCompression from "browser-image-compression";

function App() {
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  const [data, setData] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBgColor = useColorModeValue("white", "gray.800");

  async function fetchDataFromGeminiProVisionAPI(compressedFile) {
    try {
      if (!inputText) {
        setInputText("Explain this image in around 50 words");
      }

      setLoading(true);
      setIsOpen(true);
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const imageParts = await Promise.all([
        fileToGenerativePart(compressedFile),
      ]);

      const photoDataURL = URL.createObjectURL(compressedFile);
      setPhotoURL(photoDataURL);

      const result = await model.generateContent([inputText, ...imageParts]);
      const text = result.response.text();

      setLoading(false);
      setData(text);
      setInputText("");
    } catch (error) {
      toast.error(error.message);
      setLoading(false);
      console.error("fetchDataFromGeminiAPI error: ", error);
    }
  }

  async function fileToGenerativePart(file) {
    const base64EncodedDataPromise = new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(",")[1]);
      reader.readAsDataURL(file);
    });
    return {
      inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
  }

  const closeModal = () => {
    setIsOpen(false);
  };

  async function handleImageUpload(event) {
    try {
      const file = event.target.files[0];
      setImageFile(file);
      const photoDataURL = URL.createObjectURL(file);
      setPhotoURL(photoDataURL);
    } catch (error) {
      console.log(error);
      toast.error("Error uploading image. Please try again.");
    }
  }

  async function handleAnalyzeClick() {
    try {
      if (!imageFile) {
        toast.error("Please select an image!");
        return;
      }

      if (!inputText) {
        toast.info("Generating text about the picture in 50 words...");
        setInputText("Explain this image in around 50 words");
      }

      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(imageFile, options);
      fetchDataFromGeminiProVisionAPI(compressedFile);
    } catch (error) {
      console.log(error);
      toast.error("Error analyzing image. Please try again.");
    }
  }

  return (
    <ChakraProvider>
      <Box bg={bgColor} minHeight="100vh" py={10}>
        <Container maxW="xl">
          <VStack spacing={8} align="stretch">
            <Heading as="h1" size="xl" textAlign="center">
              Image Analysis App
            </Heading>
            <Box bg={cardBgColor} p={6} borderRadius="lg" boxShadow="md">
              <VStack spacing={4}>
                <Button
                  as="label"
                  htmlFor="imageUpload"
                  leftIcon={<Icon as={AddIcon} />}
                  colorScheme="blue"
                  cursor="pointer"
                >
                  Upload Image
                  <input
                    id="imageUpload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: "none" }}
                  />
                </Button>
                {photoURL && (
                  <Image
                    src={photoURL}
                    alt="Uploaded image"
                    maxH="200px"
                    objectFit="contain"
                  />
                )}
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Explain this image in around 50 words"
                  variant="filled"
                />
                <Button
                  colorScheme="green"
                  onClick={handleAnalyzeClick}
                  isLoading={loading}
                  loadingText="Analyzing..."
                  width="full"
                >
                  Analyze Image
                </Button>
              </VStack>
            </Box>
          </VStack>
        </Container>
      </Box>
      <Modal isOpen={isOpen} onClose={closeModal} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Image Analysis Result</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {photoURL && (
              <Image
                src={photoURL}
                alt="Analyzed image"
                maxH="300px"
                objectFit="contain"
                mb={4}
              />
            )}
            <Text>{data}</Text>
          </ModalBody>
        </ModalContent>
      </Modal>
      <ToastContainer />
    </ChakraProvider>
  );
}

export default App;