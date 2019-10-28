import React from "react";
import { useFormState } from "react-use-form-state";
import KNoTCloudWebSocket from "@cesarbr/knot-cloud-websocket";
import logo from "./assets/freepik-logo.png";
import background from "./assets/background.jpg";
import smart from "./assets/smart.png";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

function App() {
  const [knotSocket, setKnotSocket] = React.useState(null);
  const [currentValue, setCurrentValue] = React.useState(null);
  const [deviceId, setDeviceId] = React.useState(null);

  const [history, setHistory] = React.useState([
    /*{ name: "Page A", uv: 4000 },
    { name: "Page B", uv: 3000 },
    { name: "Page C", uv: 2000 },
    { name: "Page D", uv: 1500 },
    { name: "Page E", uv: 1890 },
    { name: "Page F", uv: 2390 },
    { name: "Page G", uv: 3490 }*/
  ]);

  const [formState, { text }] = useFormState({
    protocol: "wss",
    hostname: "ws.cloud",
    port: "443",
    pathname: "/",
    id: "7d7d6432-4499-406e-80f5-c112ab95f728",
    token: "698d0655441576c4add098c7274fa0b69c50c998",
    deviceName: "Thing001",
    sensorId: "1"
  });

  const newData = value => {
    console.log(value);
    setCurrentValue(value);
    setHistory([...history, { name: Date.now.toString, uv: value }]);
    console.log(history);
  };

  const handleSubmit = event => {
    event.preventDefault();
    const client = new KNoTCloudWebSocket(formState.values);
    setKnotSocket(client);

    client.connect();

    client.on("ready", () => {
      client.getDevices({
        type: "knot:thing"
      });
    });

    client.on("devices", devicesReceived => {
      devicesReceived.forEach(device => {
        if (device.metadata.name === formState.values.deviceName) {
          setDeviceId(device.knot.id);
        }
      });
      newData(10);
    });

    client.on("data", data => {
      console.log(data);
      if (deviceId === data.from) {
        console.log("call newData");
        newData(data.payload.value);
      }
    });
  };

  return (
    <div
      style={{
        background: `url(${background})`,
        backgroundSize: "cover",
        backgroundRepeat: "repeat",
        minHeight: "100vh",
        backgroundAttachment: "fixed"
      }}
    >
      <nav
        class="navbar navbar-dark"
        style={{ backgroundColor: "#073358", color: "white", opacity: "0.95" }}
      >
        <a class="navbar-brand" href="#">
          <img src={smart} height="50px" />
        </a>
      </nav>
      <div className="container">
        <form onSubmit={handleSubmit} className="form-group">
          <div className="row mt-2">
            <div className="col-sm-6">
              <div className="card">
                <label
                  className="card-header"
                  style={{
                    backgroundColor: "#073358",
                    color: "white",
                    opacity: "0.9"
                  }}
                >
                  Cloud{" "}
                </label>

                <div className="card-body">
                  <div className="row">
                    <label className="col-sm-4 col-form-label">Hostname </label>
                    <input
                      {...text("hostname")}
                      className="col-sm-8 form-control"
                      placeholder="hostname"
                    />
                  </div>

                  <div className="row">
                    <label className="col-sm-4 col-form-label">Port </label>
                    <input
                      {...text("port")}
                      className="col-sm-8 form-control"
                      placeholder="port"
                      none
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="card">
                <label
                  className="card-header"
                  style={{
                    backgroundColor: "#073358",
                    color: "white",
                    opacity: "0.9"
                  }}
                >
                  Gateway
                </label>
                <div className="card-body">
                  <div className="row">
                    <label className="col-sm-4 col-form-label">Id </label>
                    <input
                      {...text("id")}
                      className="col-sm-8 form-control"
                      placeholder="id"
                    />
                  </div>

                  <div className="row">
                    <label className="col-sm-4 col-form-label">Token </label>
                    <input
                      {...text("token")}
                      className="col-sm-8 form-control"
                      placeholder="token"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-sm-12 px-0 mt-2">
            <div className="card">
              <label
                className="card-header"
                style={{
                  backgroundColor: "#073358",
                  color: "white",
                  opacity: "0.9"
                }}
              >
                Device{" "}
              </label>
              <div className="card-body">
                <div className="row">
                  <label className="col-sm-4 col-form-label">
                    Device Name{" "}
                  </label>
                  <input
                    {...text("deviceName")}
                    className="col-sm-8 form-control"
                    placeholder="deviceName"
                  />
                </div>

                <div className="row">
                  <label className="col-sm-4 col-form-label">Sensor Id </label>
                  <input
                    {...text("sensorId")}
                    className="col-sm-8 form-control"
                    placeholder="sensorId"
                  />
                </div>
              </div>
            </div>
          </div>
          <button
            className="btn btn-primary mt-2"
            style={{ backgroundColor: "#073358", outline: "none" }}
          >
            Send
          </button>
        </form>
        <h1>{currentValue}</h1>
        <div className="card">
          <label
            className="card-header"
            style={{
              backgroundColor: "#073358",
              color: "white",
              opacity: "0.9"
            }}
          >
            Historic
          </label>
          <div className="card-body" style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <AreaChart
                data={history}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="uv"
                  stroke="#8884d8"
                  fill="#8884d8"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <br />
      <br />
      <footer
        style={{
          position: "fixed",
          bottom: 0,
          alignSelf: "flex-end",
          borderWidth: 2,
          backgroundColor: "#073358",
          opacity: 0.9,
          width: "100%",
          fontSize: "14px"
        }}
      >
        <div className="container-fluid row">
          <div
            className="col-sm-8"
            style={{ color: "white", position: "center" }}
          >
            <i>SmartLabs | 2019</i>
          </div>
          <div className="col-sm-4">
            <a
              target="blank"
              href="https://www.freepik.com/free-photos-vectors/background"
              className="float-right"
            >
              background by freepik <img src={logo} height="22px" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
