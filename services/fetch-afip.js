import axios from "axios";

const BASE_URL =
  "https://servicioscf.afip.gob.ar/FCEServicioConsulta/api/fceconsulta.aspx/";
const LoginUrl = "https://b1.ativy.com:50481/b1s/v1/Login";
const ServiceLayerBPurl = "https://b1.ativy.com:50481/b1s/v1/BusinessPartners";

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchGetGrandesEmpresas(LicTradNum) {
  let sessionId = null;
  
  while (true) {
    try {
      // Realizar el inicio de sesión en ServiceLayer
      const loginResponse = await axios.post(LoginUrl, {
        CompanyDB: "SBODEMOAROK",
        Password: "1234",
        UserName: "manager",
      });

      sessionId = loginResponse.data.SessionId;

      console.log(`Login status: ${loginResponse.data.SessionId}`);

      if (loginResponse.statusText === "OK") {
        break;
      } else {
        console.log('Error al intentar iniciar sesión. Reintentando en 1 minuto...');
        await sleep(60000); // Esperar 1 minuto antes de volver a intentar
      }
    } catch (error) {
      console.log("[FETCH AFIP]: error", error);
      throw error;
    }
  }

  try {
    // Obtener datos de AFIP
    const responseAfip = await axios.post(`${BASE_URL}getGrandesEmpresas`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    const grandesEmpresas = JSON.parse(responseAfip.data.d);

    const resultArray = [];

    LicTradNum.forEach((item) => {
      if (
        item.LicTradNum &&
        grandesEmpresas.some((empresa) => empresa.Cuit == item.LicTradNum) // Si el cuit dentro de Hana esta incluido en Afip va tYES
      ) {
        if (item.FCERelevnt == "Y") {
          // Do nothing
        } else {
          resultArray.push({ FCERelevnt: "tYES", CardCode: item.CardCode });
        }
      } else {
        if (item.FCERelevnt == "N") {
          // Do nothing
        } else {
          resultArray.push({ FCERelevnt: "tNO", CardCode: item.CardCode });
        }
      }
    });

    console.log(resultArray);

    // Actualizar FCERelevant en ServiceLayer
    for (const item of resultArray) {
      const patchFCERelevntResponse = await axios.patch(
        `${ServiceLayerBPurl}('${item.CardCode}')`,
        {
          FCERelevant: item.FCERelevnt,
        },
        {
          headers: {
            Cookie: `B1SESSION=${sessionId}; ROUTEID=.node1`,
          },
        }
      );
      console.log(patchFCERelevntResponse.status)
    }
  } catch (error) {
    console.log("[FETCH AFIP]: error", error);
    throw error;
  }
}

export default fetchGetGrandesEmpresas;
