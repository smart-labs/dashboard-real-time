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
  const [errors, setErrors] = React.useState(null);
  const limit = 5;
  const [history, setHistory] = React.useState([]);

  const [formState, { text }] = useFormState(
    JSON.parse(localStorage.getItem("knot-credentials")) || {
      protocol: "wss",
      hostname: "",
      port: "",
      pathname: "/",
      id: "",
      token: "",
      deviceName: "",
      sensorId: ""
    }
  );

  const newData = value => {
    if (history.length > limit) {
      history.shift();
    }
    setHistory(history => [
      ...history,
      { time: new Date().toLocaleTimeString(), value: value }
    ]);
  };

  const handleSubmit = event => {
    event.preventDefault();
    localStorage.setItem("knot-credentials", JSON.stringify(formState.values));
    const client = new KNoTCloudWebSocket(formState.values);
    let deviceId;

    client.on("ready", () => {
      client.getDevices({
        type: "knot:thing"
      });
    });

    client.on("devices", devicesReceived => {
      devicesReceived.forEach(device => {
        if (device.metadata.name === formState.values.deviceName) {
          deviceId = device.knot.id;
        } else {
          console.log("error");
          setErrors("No device found");
        }
      });
    });

    client.on("data", data => {
      if (deviceId === data.from) {
        newData(data.payload.value);
      }
    });

    client.on("error", data => {
      console.log({ error: data });
      setErrors("socket connection error");
    });

    client.connect();
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
        className="navbar navbar-dark"
        style={{ backgroundColor: "#073358", color: "white", opacity: "0.95" }}
      >
        <a className="navbar-brand" href="#">
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
                  Cloud
                </label>
                <div className="card-body">
                  <div className="row">
                    <label className="col-sm-4 col-form-label">Hostname</label>
                    <input
                      {...text("hostname")}
                      className="col-sm-8 form-control"
                      placeholder="ws.cloud"
                      required="required"
                    />
                  </div>
                  <div className="row">
                    <label className="col-sm-4 col-form-label"> Port </label>
                    <input
                      {...text("port")}
                      className="col-sm-8 form-control"
                      placeholder="433"
                      required="required"
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
                    <label className="col-sm-4 col-form-label"> Id </label>
                    <input
                      {...text("id")}
                      className="col-sm-8 form-control"
                      placeholder="52fc75f9-861..."
                      required="required"
                    />
                  </div>
                  <div className="row">
                    <label className="col-sm-4 col-form-label"> Token </label>
                    <input
                      {...text("token")}
                      className="col-sm-8 form-control"
                      placeholder="b9678bbd51..."
                      required="required"
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
                Device
              </label>
              <div className="card-body">
                <div className="row">
                  <label className="col-sm-4 col-form-label">Device Name</label>
                  <input
                    {...text("deviceName")}
                    className="col-sm-8 form-control"
                    placeholder="Thing001"
                    required="required"
                  />
                </div>
                <div className="row">
                  <label className="col-sm-4 col-form-label"> Sensor Id </label>
                  <input
                    {...text("sensorId")}
                    className="col-sm-8 form-control"
                    placeholder="1"
                    required="required"
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
        {errors && (
          <div className="alert alert-danger alert-dismissible fade show text-center">
            <p>
              <strong>An unexpected error occurred: </strong> {errors}
            </p>
          </div>
        )}
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
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="value"
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
            <i> SmartLabs | 2019 </i>
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
