import { useEffect, useState } from "react";


import { ScrollView, View, Text, Button } from "react-native";


import { useNavigation } from "@react-navigation/native";


import api from "./axios";


const HomeScreen = () => {
  // Estado atual do alarme
  const [alarmeAtivo, setAlarmeAtivo] = useState(false);


  // Última distância conhecida
  const [distancia, setDistancia] = useState(0);


  // Limite de segurança configurado
  const [limite, setLimite] = useState(15);


  // Situação enviada pela ESP32
  const [intrusao, setIntrusao] = useState(false);


  const navigation = useNavigation();


  // ------------------------------------------------
  // CAMERA
  // ------------------------------------------------


  const handleCam = () => {
    navigation.navigate("Cam");
  };


  // ------------------------------------------------
  // CONSULTAR ADAFRUIT IO
  // ------------------------------------------------


  async function atualizarDados() {
    try {
      // Consulta estado do alarme
      const respostaAlarme = await api.getAlarme();


      const valorAlarme = String(respostaAlarme.data.value)
        .trim()
        .toLowerCase();


      setAlarmeAtivo(valorAlarme === "true");


      // Consulta distância
      const respostaDistancia = await api.getDistancia();


      const valorDistancia = Number(respostaDistancia.data.value);


      if (Number.isFinite(valorDistancia)) {
        setDistancia(valorDistancia);
      }


      // Consulta o limite atual
      const respostaLimite = await api.getLimite();


      const valorLimite = Number(respostaLimite.data.value);


      if (Number.isFinite(valorLimite)) {
        setLimite(valorLimite);
      }


      // Consulta a intrusão
      const respostaIntrusao = await api.getIntrusao();


      const valorIntrusao = String(respostaIntrusao.data.value)
        .trim()
        .toLowerCase();


      setIntrusao(valorIntrusao === "true");
    } catch (error) {
      console.log("Erro ao atualizar dados:", error.message);
    }
  }


  // ------------------------------------------------
  // POLLING
  // ------------------------------------------------


  useEffect(() => {
    // Atualiza assim que
    // a tela for aberta
    atualizarDados();


    // Depois consulta novamente
    // a cada 3 segundos
    const intervalo = setInterval(atualizarDados, 3000);


    return () => {
      clearInterval(intervalo);
    };
  }, []);


  // ------------------------------------------------
  // ARMAR / DESARMAR
  // ------------------------------------------------


  async function alternarAlarme() {
    try {
      const novoEstado = !alarmeAtivo;


      await api.setAlarme(novoEstado);


      // Atualiza imediatamente
      // a interface
      setAlarmeAtivo(novoEstado);
    } catch (error) {
      console.log("Erro ao alterar alarme:", error.message);
    }
  }


  // ------------------------------------------------
  // ALTERAR O LIMITE
  // ------------------------------------------------


  async function alterarLimite(novoLimite) {
    try {
      await api.setLimite(novoLimite);


      // Atualiza imediatamente
      // a interface
      setLimite(novoLimite);
    } catch (error) {
      console.log("Erro ao alterar limite:", error.message);
    }
  }


  // ------------------------------------------------
  // ESTADO VISUAL
  // ------------------------------------------------


  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
      }}
    >
      <Text
        style={{
          fontSize: 28,
          fontWeight: "bold",
          marginBottom: 20,
        }}
      >
        Sistema de Alarme
      </Text>


      <Text
        style={{
          fontSize: 22,
          marginBottom: 10,
        }}
      >
        {alarmeAtivo ? "ALARME ARMADO" : "ALARME DESARMADO"}
      </Text>


      <Text
        style={{
          fontSize: 20,
          marginBottom: 10,
        }}
      >
        Distância: {distancia} cm
      </Text>


      <Text
        style={{
          fontSize: 20,
          marginBottom: 20,
        }}
      >
        Limite de segurança: {limite} cm
      </Text>


      {intrusao ? (
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            marginBottom: 20,
            color: "red",
          }}
        >
          INTRUSÃO DETECTADA!
        </Text>
      ) : (
        <Text
          style={{
            fontSize: 20,
            marginBottom: 20,
            color: "green",
          }}
        >
          AMBIENTE SEGURO
        </Text>
      )}


      <View
        style={{
          marginBottom: 20,
        }}
      >
        <Button
          title={alarmeAtivo ? "Desarmar Alarme" : "Armar Alarme"}
          onPress={alternarAlarme}
          color={alarmeAtivo ? "red" : "green"}
        />
      </View>


      <View
        style={{
          marginBottom: 20,
          gap: 8,
        }}
      >
        <Button
          title="Limite 10 cm"
          onPress={() => alterarLimite(10)}
          color="gray"
        />

        <Button
          title="Limite 20 cm"
          onPress={() => alterarLimite(20)}
          color="gray"
        />

        <Button
          title="Limite 30 cm"
          onPress={() => alterarLimite(30)}
          color="gray"
        />
      </View>


      <Button title="Abrir Câmera" onPress={handleCam} color="blue" />
    </ScrollView>
  );
};


export default HomeScreen;