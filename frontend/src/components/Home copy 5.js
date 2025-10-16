import React, { useEffect, useState } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, ReferenceDot, Label  } from "recharts";
import { PieChart, Pie, Cell} from "recharts";
import { API_BASE_URL } from '../config';
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [data, setData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [selectedStore, setSelectedStore] = useState("All");
  const [stores, setStores] = useState([]);
  const [userid, setUserid] = useState('');
  const [isRestricted, setIsRestricted] = useState(false);
  const navigate = useNavigate();

  const getYesterdayDate = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().slice(0, 10);
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  };
  
  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    const storedUserid = localStorage.getItem('userid');
    const storedUserGroup = localStorage.getItem('userGroup');

    setUsername(storedUsername || '');
    setUserid(storedUserid || '');
    setUserGroup(storedUserGroup || '');

    if (storedUserid) {
      fetchEmployeeProfile(storedUserid, storedUserGroup);
    } else {
      fetchStores();
    }
  }, []);

  const fetchEmployeeProfile = async (employeeId, userGroup) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/profile/${employeeId}/`);
      const profile = response.data;

      let storeCodes = [];
      
      if (["IT Support", "Regional IT Manager","Assistant IT Incharge", "IT Incharge"].includes(profile.designation)) {
        storeCodes = profile.storeunder ? profile.storeunder.split(',').map(code => code.trim()) : [];
        if (!storeCodes.includes(profile.storecode)) {
          storeCodes.unshift(profile.storecode);
        }
      }

      if (storeCodes.length > 0) {
        fetchStoresByCodes(storeCodes);
      } else {
        fetchStores();
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchStoresByCodes = async (storeCodes) => {
    try {
      const storeRequests = storeCodes.map(code => axios.get(`${API_BASE_URL}/api/store/${code}/`));
      const storeResponses = await Promise.all(storeRequests);

      const storeDetails = storeResponses.map(res => ({
        storecode: res.data.storecode,
        storename: res.data.storename
      }));

      setStores(storeDetails);
      fetchData(storeDetails.map(store => store.storecode));
    } catch (error) {
      console.error("Error fetching stores:", error);
    }
  };

  const fetchStores = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/stores/`);
      setStores(response.data);
      fetchData(response.data.map(store => store.storecode ));
    } catch (error) {
      console.error("Error fetching stores:", error);
    }
  };

  const fetchData = async (storeCodes) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/?format=json`);
      const filteredData = response.data.data.filter(store => storeCodes.includes(store.store));
      
      setData(filteredData);
      transformChartData(filteredData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const transformChartData = (stores) => {
    const formattedData = stores.map((store) => ({
      store: store.store,
      storename: store.storename,
      zdsr: Number(store.zdsr) || 0,
      zread: Number(store.zread) || 0,
      totalpayment: Number(store.totalpayment) || 0,
      expectedpayment: Number(store.expectedpayment) || 0,
      actualpayment: Number(store.actualpayment) || 0,
      cashiershortexcess: Number(store.cashiershortexcess) || 0,
      zdsrzread: Number(store.zdsrzread) || 0,
      zpmc: Number(store.zpmc) || 0,
      pos_ok: store.pos_ok || 0,
      pos_not_ok: store.pos_not_ok || 0,
      pdt_ok: store.pdt_ok || 0,
      pdt_not_ok: store.pdt_not_ok || 0,
      scale_ok: store.scale_ok || 0,
      scale_not_ok: store.scale_not_ok || 0,
      ups_ok: store.ups_ok || 0,
      ups_not_ok: store.ups_not_ok || 0,
      server_ok: store.server_ok || 0,
      server_not_ok: store.server_not_ok || 0,
      ind_backup_ok: store.ind_backup_ok || 0,
      ind_backup_not_ok: store.ind_backup_not_ok || 0,
      acronics_ok: store.acronics_ok || 0,
      acronics_not_ok: store.acronics_not_ok || 0,
      sales_ok: store.sales_ok || 0,
      sales_not_ok: store.sales_not_ok || 0,
      pos_backup_ok: store.pos_backup_ok || 0,
      pos_backup_not_ok: store.pos_backup_not_ok || 0,
    }));
    setChartData(formattedData);
  };
  
  const colors = {
    pos_ok: "#358639",
    pos_not_ok: "#D32F2F",
    pdt_ok: "#358639",
    pdt_not_ok: "#D32F2F",
    scale_ok: "#358639",
    scale_not_ok: "#D32F2F",
    ups_ok: "#358639",
    ups_not_ok: "#D32F2F",
    server_ok: "#358639",
    server_not_ok: "#D32F2F",
    ind_backup_ok: "#358639",
    ind_backup_not_ok: "#D32F2F",
    acronics_ok: "#358639",
    acronics_not_ok: "#D32F2F",
    sales_ok:  "#358639",
    sales_not_ok:"#D32F2F",
    pos_backup_ok: "#358639",
    pos_backup_not_ok: "#D32F2F",
  };

  const summaryData = selectedStore === "All"
    ? chartData.reduce((acc, item) => {
        Object.keys(acc).forEach((key) => {
          if (typeof item[key] === "number") {
            acc[key] += item[key]; 
          }
        });
        return acc;
      }, { store: "All", storename: "All", totalpayment: 0, expectedpayment: 0, actualpayment: 0, 
          cashiershortexcess: 0, zdsr: 0, zread: 0, zdsrzread: 0, zpmc: 0 })  // 🔹 Add missing keys
    : chartData.find((item) => item.store === selectedStore) || {};


  const filteredData = selectedStore === "All"
    ? chartData
    : chartData.filter((item) => item.store === selectedStore);


  const filteredTableData = selectedStore === "All" 
    ? data 
    : data.filter((item) => item.store === selectedStore);

  const storeNames = ["All", ...new Set(data.map((item) => item.store))];

  const tables = [
    { title: "🛒 PLU2 Status", color: "blue", keyPrefix: "plu2" },
    { title: "🖥️ POS Status", color: "red", keyPrefix: "pos" },
    { title: "⚖️ Scale Status", color: "yellow", keyPrefix: "scale" },
    { title: "🖥️ Server Status", color: "gray", keyPrefix: "server" },
    { title: "📂 Server Storage", color: "gray", keyPrefix: "server_storage" },
    { title: "📄 Zvchr Status", color: "pink", keyPrefix: "zvchr" },
  ];

  const tables1 = [
    { title: "💰 Sale Posting", color: "green", keyPrefix: "sale" },
    { title: "🖥️ POS Performance", color: "cyan", keyPrefix: "pos_performance" },
    { title: "📱 PDT Status", color: "purple", keyPrefix: "pdt" },
    { title: "⚡ UPS Status", color: "orange", keyPrefix: "ups" },
    { title: "🛍️ Sale Status", color: "indigo", keyPrefix: "sale_status" },
    { title: "🗂️ Ind Store Backup", color: "amber", keyPrefix: "ind_store_backup" },
    { title: "💾 Acronics Backup", color: "lime", keyPrefix: "acronics_backup" },
  ];

  const getColor = (status, type) => {
    if (type === "plu2Status") {
      return status === "Manually Generated" ? "#ffd957" : status === "Generated" ? "#358639" : status === "Not Generated" ? "#e15759": "#4e79a7";
    }
    if (type === "folderStatus") {
      return status === "F:\\TPDotnet\\Server\\HostData\\Upload\\Processed" ? "#358639" : 
             status === "F:\\TPDotnet\\Server\\HostData\\Upload\\Data" ? "#ffd957" :
             status === "F:\\TPDotnet\\Server\\HostData\\Upload\\Invalid" ? "#e15759" 
             : "#4e79a7";
    }
    if (type === "eodStatus" || type === "idocFileStatus") {
      return status === "Success" ? "#358639" : status === "Failure" ? "#e15759" : "#4e79a7";
    }

    if (type === "pos_overall_status" || type === "scale_overall_status" || type === "pdt_overall_status" || 
      type === "ups_overall_status" ||type === "server_overall_status" || type === "ind_backup_overall_status" 
      ||type === "acronics_overall_status" || type === "sales_overall_status") {
      return status === "Ok" ? "#358639" : status === "Not Ok" ? "#e15759" : "#4e79a7";
    }
    
    return "#4e79a7";
  };
  

  const processData = (data, statusType) => {
    const counts = data.reduce((acc, item) => {
      const key = `${item.store} - ${item[statusType]}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  
    return Object.entries(counts).map(([key, value]) => {
      const [store, status] = key.split(" - ");
      return {
        name: `${store} (${status})`,
        value,
        store,
        status,
        color: getColor(status, statusType),
      };
    });
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { name, color } = payload[0];
  
      // Format label: "9201(Not ok)" → "9201: Not ok"
      const formattedName = name.replace(/\((.*?)\)/, (_, status) => `: ${capitalizeFirstLetter(status)}`);
  
      return (
        <div className="p-4 rounded-2xl shadow-xl border border-gray-300"
             style={{
               background: "linear-gradient(135deg, #f0f4ff, #e0ecff)", // soft blue gradient
             }}>
          <div className="flex items-center space-x-3">
            <span
              className="inline-block w-3.5 h-3.5 rounded-full"
              style={{ backgroundColor: color }}
            ></span>
            <p className="text-base font-medium text-gray-800">{formattedName}</p>
          </div>
        </div>
      );
    }
  
    return null;
  };
  
  const capitalizeFirstLetter = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };
  
  const [username, setUsername] = useState('');
  const [userGroup, setUserGroup] = useState('');
  
  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    const storedUserGroup = localStorage.getItem('userGroup');
    setUsername(storedUsername || ''); 
    setUserGroup(storedUserGroup || ''); 
  }, []);

  const handleBarClick = (category, entry, statusType) => {
    const store = entry.store;
    const status = (category === "ind_backup" || category === "acronics") ? null :
      statusType === "ok" ? "ok" : "not ok";
    const date = category === "sales" ? getYesterdayDate() : getTodayDate();
  
    const state = {
      store,
      date,
      status,
      autoNavigateToTab2: true
    };
  
    let path = "/";
    switch (category) {
      case "pos":
        path = "/pos_status";
        break;
      case "pdt":
        path = "/pdt_status";
        break;
      case "scale":
        path = "/scale_status";
        break;  
      case "ind_backup":
        path = "/ind_store_backup_status";
        break;  
      case "ups":
        path = "/ups_amc_status";
        break;  
      case "sales":
        path = "/sales_status";
        break;  
      case "server":
        path = "/server_status";
        break;
      case "acronics":
        path = "/acronics_backup_status";
        break;
      default:
        return; 
    }
  
    navigate(path, { state });
  };

  const handleRowClick = (keyPrefix, store, status) => {
    const useYesterday = keyPrefix === "plu2" || keyPrefix === "sale" || keyPrefix === "sale_status" || keyPrefix === "zvchr" || keyPrefix === "pos_performance";
    const date = useYesterday ? getYesterdayDate() : getTodayDate();
  
    const pathMap = {
      plu2: "/plu2_Checklist",
      pos: "/pos_status",
      scale: "/scale_status",
      server: "/server_status",
      server_storage: "/server_storage_status",
      zvchr: "/zvchr_status",
      sale: "/sale_posting",
      pos_performance: "/pos_performance_checklist",
      pdt: "/pdt_status",
      ups: "/ups_amc_status",
      sale_status: "/sales_status",
      ind_store_backup: "/ind_store_backup_status",
      acronics_backup: "/acronics_backup_status"
    };
  
    const path = pathMap[keyPrefix];
    if (!path) return; // safety
  
    navigate(path, {
      state: {
        store,
        date,
        autoNavigateToTab2: true
      }
    });
  };

  if (userGroup === "Admin_User") {
    return(
      <>
        <div className="p-6 min-h-screen bg-gray-100">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Store Status Overview</h2>
          <div className="mb-4 flex items-center gap-3">
            <label htmlFor="storeFilter" className="text-sm font-semibold text-gray-800 whitespace-nowrap">
              Select Store:  
            </label>
            <select
              id="storeFilter"
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="p-3 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:shadow-md transition duration-200"
            >
              {storeNames
              .filter((store) => store !== "9000")
              .map((store) => (
                <option key={store} value={store} className="text-gray-900">
                  {store}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-gray-600 p-6" style={{ paddingLeft: "30px", height: "0px" }}>
            {[
              { key: "plu2Status", title: "PLU2 Status" }
            ].map(({ key, title }) => (
              <div key={key} className="flex flex-col items-center bg-white shadow-lg rounded-xl p-6 " style={{ width: "430px" }}>
                <ResponsiveContainer width={370} height={370}>
                  <PieChart>
                    <Pie
                      data={processData(filteredTableData.filter(item => item.store !== "9820"), key)}
                      cx="50%"
                      cy="50%"
                      innerRadius={100}
                      outerRadius={140}
                      dataKey="value"
                      stroke="none"
                      paddingAngle={4}
                      cornerRadius={8}
                    >
                      {processData(filteredTableData.filter(item => item.store !== "9820"), key).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} onClick={() => {
                          localStorage.setItem('store', entry.store); // Save for later fallback
                          navigate('/plu2_Checklist', {
                            state: {
                              store: entry.store,
                              date: getYesterdayDate(),
                              autoNavigateToTab2: true,
                            },
                          });
                        }}/>
                      ))}
                    </Pie>
                    <text
                      x="50%"
                      y="50%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="14"
                      fontWeight="bold"
                      fill="#333"
                    >
                      {title}
                    </text>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 bg-gray-600 gap-6" style={{ paddingLeft: "470px", height: "0px" }}>
            {[
              { key: "eodStatus", title: "EOD Final Status" },
            ].map(({ key, title }) => (
              <div key={key} className="flex flex-col items-center bg-white shadow-lg rounded-xl p-6" style={{ width: "430px" }}>
                <ResponsiveContainer width={370} height={370}>
                  <PieChart>
                    <Pie
                      data={processData(filteredTableData.filter(item => item.store !== "9820"), key)}
                      cx="50%"
                      cy="50%"
                      innerRadius={100} 
                      outerRadius={140}
                      dataKey="value"
                      stroke="none"
                      paddingAngle={4}
                      cornerRadius={8} 
                    >
                      {processData(filteredTableData.filter(item => item.store !== "9820"), key).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} onClick={() => {
                          localStorage.setItem('store', entry.store); // Save for later fallback
                          navigate('/plu2_Checklist', {
                            state: {
                              store: entry.store,
                              date: getYesterdayDate(),
                              autoNavigateToTab2: true,
                            },
                          });
                        }}/>
                      ))}
                    </Pie>
                    <text 
                      x="50%" 
                      y="50%" 
                      textAnchor="middle" 
                      dominantBaseline="middle" 
                      fontSize="14" 
                      fontWeight="bold" 
                      fill="#333"
                    >
                      {title}
                    </text>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 bg-gray-600 gap-6" style={{ paddingLeft: "910px", height: "0px" }}>
            {[
              { key: "idocFileStatus", title: "IDoc File Upload Status" },
            ].map(({ key, title }) => (
              <div key={key} className="flex flex-col items-center bg-white shadow-lg rounded-xl p-6" style={{ width: "365px" }}>
                <ResponsiveContainer width={370} height={370}>
                  <PieChart>
                    <Pie
                      data={processData(filteredTableData.filter(item => item.store !== "9820"), key)}
                      cx="50%"
                      cy="50%"
                      innerRadius={100} 
                      outerRadius={140}
                      dataKey="value"
                      stroke="none"
                      paddingAngle={4}
                      cornerRadius={8} 
                    >
                      {processData(filteredTableData.filter(item => item.store !== "9820"), key).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} onClick={() => {
                          localStorage.setItem('store', entry.store); // Save for later fallback
                          navigate('/plu2_Checklist', {
                            state: {
                              store: entry.store,
                              date: getYesterdayDate(),
                              autoNavigateToTab2: true,
                            },
                          });
                        }}/>
                      ))}
                    </Pie>
                    <text 
                      x="50%" 
                      y="50%" 
                      textAnchor="middle" 
                      dominantBaseline="middle" 
                      fontSize="14" 
                      fontWeight="bold" 
                      fill="#333"
                    >
                      {title}
                    </text>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 bg-gray-600 gap-6" style={{ paddingLeft: "1285px"}}>
            {[
              {key: "folderStatus", title: "PLU2 Containing Folder"},
            ].map(({ key, title }) => (
              <div key={key} className="flex flex-col items-center bg-white shadow-lg rounded-xl p-6" style={{ width: "365px" }}>
                <ResponsiveContainer width={370} height={370}>
                  <PieChart>
                    <Pie
                      data={processData(filteredTableData.filter(item => item.store !== "9820"), key)}
                      cx="50%"
                      cy="50%"
                      innerRadius={100} 
                      outerRadius={140}
                      dataKey="value"
                      stroke="none"
                      paddingAngle={4}
                      cornerRadius={8} 
                    >
                      {processData(filteredTableData.filter(item => item.store !== "9820"), key).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} onClick={() => {
                          localStorage.setItem('store', entry.store); // Save for later fallback
                          navigate('/plu2_Checklist', {
                            state: {
                              store: entry.store,
                              date: getYesterdayDate(),
                              autoNavigateToTab2: true,
                            },
                          });
                        }}/>
                      ))}
                    </Pie>
                    {/* Title inside the donut chart */}
                    <text 
                      x="50%" 
                      y="50%" 
                      textAnchor="middle" 
                      dominantBaseline="middle" 
                      fontSize="14" 
                      fontWeight="bold" 
                      fill="#333"
                    >
                      {title}
                    </text>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap justify-center p-6 bg-gray-100" style={{  paddingTop: "20px", paddingLeft: "30px", height: "0px" }}>
            <div className="grid grid-cols-3 gap-4 mb-6 w-full">
              {[
                { title: "Total Payment", key: "totalpayment" },
                { title: "Expected Payment", key: "expectedpayment" },
                { title: "Actual Payment", key: "actualpayment" },
                { title: "Cashier Short/Excess", key: "cashiershortexcess" },
              ].map((item, index) => (
                <div key={index} className="bg-white shadow-lg rounded-xl p-4 text-center" style={{ width: "210px", height: "150px" }}>
                  <h4 className="text-lg font-semibold text-gray-700">{item.title}</h4>
                  <p className="text-xl font-bold text-blue-600">
                  {summaryData[item.key] !== undefined ? summaryData[item.key].toLocaleString() : "--"}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap justify-center p-6 bg-gray-100" style={{ paddingLeft: "250px", height: "0px" }}>
            <div className="grid grid-cols-3 gap-4 mb-6 w-full">
              {[
                { title: "ZDSR", key: "zdsr" },
                { title: "Z-Read", key: "zread" },
                { title: "ZDSR - ZRead", key: "zdsrzread" },
                { title: "ZPMC Difference", key: "zpmc" },
              ].map((item, index) => (
                <div key={index} className="bg-white shadow-lg rounded-xl p-4 text-center" style={{ width: "210px", height: "150px" }}>
                  <h4 className="text-lg font-semibold text-gray-700">{item.title}</h4>
                  <p className="text-xl font-bold text-blue-600">
                  {summaryData[item.key] !== undefined ? summaryData[item.key].toLocaleString() : "--"}
                  </p>
                </div>
              ))}
            </div>      
          </div>
          <div className="flex flex-wrap justify-center p-6 bg-gray-100" style={{ paddingLeft: "470px" }}>
            <div className="w-full bg-white shadow-lg rounded-xl p-6" style={{ width: "1180px" }}>
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Sales</h3>
              <ResponsiveContainer width="100%" height={540}>
                <LineChart
                  data={filteredData.filter(item => item.store !== "9820")}
                  margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                  <XAxis dataKey="store" tick={{ fill: "#555", fontSize: 12, fontWeight: 600 }} />
                  <YAxis tick={{ fill: "#555", fontSize: 12, fontWeight: 600 }} domain={["auto", "auto"]} />
                  <Tooltip contentStyle={{ backgroundColor: "white", borderRadius: "8px", border: "1px solid #ddd", fontSize: "12px" }} />
                  <Legend verticalAlign="top" height={36} />

                  <Line type="monotone" dataKey="zdsr" stroke="#ff7300" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="zread" stroke="#0088FE" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="totalpayment" stroke="#8884d8" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="expectedpayment" stroke="#387908" strokeWidth={2} dot={false} />

                  {filteredData.filter(item => item.store !== "9820").map((item, index) => {
                    const isWarning = !(item.zdsr === item.zread && item.zread === item.totalpayment && item.totalpayment === item.expectedpayment);
                    const isAllZero = item.zdsr === 0 && item.zread === 0 && item.totalpayment === 0 && item.expectedpayment === 0;
                    const isEqual = item.zdsr === item.zread && item.zread === item.totalpayment && item.totalpayment === item.expectedpayment;

                    return (
                      <React.Fragment key={`dots-${index}`}>
                        {isWarning && (
                          <ReferenceDot
                            x={item.store}
                            y={Math.max(item.zdsr, item.zread, item.totalpayment, item.expectedpayment)}
                            r={10}
                            fill="#e15759"
                            stroke="black"
                            onClick={() => navigate('/sale_posting', {
                              state: {
                                store: item.store,
                                date: getYesterdayDate(),
                                autoNavigateToTab2: true,
                              },
                            })}
                          >
                            <Label
                              value="⚠️"
                              position="top"
                              fill="#e15759"
                              fontSize={16}
                              fontWeight="bold"
                            />
                          </ReferenceDot>
                        )}
                        {isEqual && (
                          <ReferenceDot
                            x={item.store}
                            y={item.zdsr}
                            r={6}
                            fill="#28A745"
                            stroke="black"
                            onClick={() => navigate('/sale_posting', {
                              state: {
                                store: item.store,
                                date: getYesterdayDate(),
                                autoNavigateToTab2: true,
                              },
                            })}
                          >
                            <Label
                              fill="#28A745"
                              fontSize={16}
                              fontWeight="bold"
                            />
                          </ReferenceDot>
                        )}
                        {isAllZero && (
                          <ReferenceDot
                            x={item.store}
                            y={0}
                            r={1}
                            fill="#0000FF"
                            stroke="black"
                            onClick={() => navigate('/sale_posting', {
                              state: {
                                store: item.store,
                                date: getYesterdayDate(),
                                autoNavigateToTab2: true,
                              },
                            })}
                          >
                            <Label
                              value="🔵"
                              fontSize={14}
                              fontWeight="bold"
                            />
                          </ReferenceDot>
                        )}
                      </React.Fragment>
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-gray-600 p-6"
            style={{ paddingTop: "20px", paddingLeft: "30px", height: "0px" }}
          >
            {[
              { key: "pos_overall_status", title: "POS Overall Status" }
            ].map(({ key, title }) => {
              const filteredPieData = filteredTableData.filter(item => item.store !== "9820");

              return (
                <div
                  key={key}
                  className="flex flex-col items-center bg-white shadow-lg rounded-xl p-6"
                  style={{ width: "430px" }}
                >
                  <ResponsiveContainer width={370} height={370}>
                    <PieChart>
                      <Pie
                        data={processData(filteredPieData, key)}
                        cx="50%"
                        cy="50%"
                        innerRadius={100}
                        outerRadius={140}
                        dataKey="value"
                        stroke="none"
                        paddingAngle={4}
                        cornerRadius={8}
                      >
                        {processData(filteredPieData, key).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} onClick={() => {
                            localStorage.setItem('store', entry.store); // Save for later fallback
                            navigate('/pos_status', {
                              state: {
                                store: entry.store,
                                date: getTodayDate(),
                                status:entry.status,
                                autoNavigateToTab2: true,
                              },
                            });
                          }}/>
                        ))}
                      </Pie>
                      <text
                        x="50%"
                        y="50%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="14"
                        fontWeight="bold"
                        fill="#333"
                      >
                        {title}
                      </text>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              );
            })}
          </div>
          <div
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-gray-600 p-6"
            style={{ paddingTop: "0px", paddingLeft: "470px", height: "0px" }}
          >
            {[
              { key: "scale_overall_status", title: "Scale Overall Status" }
            ].map(({ key, title }) => {
              // Apply conditional filtering
              const data =
                key === "scale_overall_status"
                  ? filteredTableData.filter(
                      (item) => item.store !== "9250" && item.store !== "9220" && item.store !== "9820"
                    )
                  : filteredTableData;

              return (
                <div
                  key={key}
                  className="flex flex-col items-center bg-white shadow-lg rounded-xl p-6"
                  style={{ width: "430px" }}
                >
                  <ResponsiveContainer width={370} height={370}>
                    <PieChart>
                      <Pie
                        data={processData(data, key)}
                        cx="50%"
                        cy="50%"
                        innerRadius={100}
                        outerRadius={140}
                        dataKey="value"
                        stroke="none"
                        paddingAngle={4}
                        cornerRadius={8}
                      >
                        {processData(data, key).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} onClick={() => {
                            localStorage.setItem('store', entry.store); // Save for later fallback
                            navigate('/scale_status', {
                              state: {
                                store: entry.store,
                                date: getTodayDate(),
                                status:entry.status,
                                autoNavigateToTab2: true,
                              },
                            });
                          }}/>
                        ))}
                      </Pie>
                      <text
                        x="50%"
                        y="50%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="14"
                        fontWeight="bold"
                        fill="#333"
                      >
                        {title}
                      </text>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              );
            })}
          </div>
          <div
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-gray-600 p-6"
            style={{ paddingTop: "0px", paddingLeft: "910px", height: "0px" }}
          >
            {[
              { key: "pdt_overall_status", title: "PDT Overall Status" }
            ].map(({ key, title }) => {
              const filteredPieData = filteredTableData.filter(item => item.store !== "9250" && item.store !== "9220" && item.store !== "9820");

              return (
                <div
                  key={key}
                  className="flex flex-col items-center bg-white shadow-lg rounded-xl p-6"
                  style={{ width: "365px" }}
                >
                  <ResponsiveContainer width={370} height={370}>
                    <PieChart>
                      <Pie
                        data={processData(filteredPieData, key)}
                        cx="50%"
                        cy="50%"
                        innerRadius={100}
                        outerRadius={140}
                        dataKey="value"
                        stroke="none"
                        paddingAngle={4}
                        cornerRadius={8}
                      >
                        {processData(filteredPieData, key).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} onClick={() => {
                            localStorage.setItem('store', entry.store); 
                            navigate('/pdt_status', {
                              state: {
                                store: entry.store,
                                date: getTodayDate(),
                                status:entry.status,
                                autoNavigateToTab2: true,
                              },
                            });
                          }}/>
                        ))}
                      </Pie>
                      <text
                        x="50%"
                        y="50%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="14"
                        fontWeight="bold"
                        fill="#333"
                      >
                        {title}
                      </text>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-gray-600 p-6" style={{ paddingTop: "0px", paddingLeft: "1285px", height: "0px" }}>
            {[
              { key: "ups_overall_status", title: "UPS AMC Overall Status" }
            ].map(({ key, title }) => (
              <div key={key} className="flex flex-col items-center bg-white shadow-lg rounded-xl p-6 " style={{ width: "365px" }}>
                <ResponsiveContainer width={370} height={370}>
                  <PieChart>
                    <Pie
                      data={processData(filteredTableData, key)}
                      cx="50%"
                      cy="50%"
                      innerRadius={100} 
                      outerRadius={140}
                      dataKey="value"
                      stroke="none"
                      paddingAngle={4}
                      cornerRadius={8} 
                    >
                      {processData(filteredTableData, key).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} onClick={() => {
                          localStorage.setItem('store', entry.store); // Save for later fallback
                          navigate('/ups_amc_status', {
                            state: {
                              store: entry.store,
                              date: getTodayDate(),
                              status:entry.status,
                              autoNavigateToTab2: true,
                            },
                          });
                        }}/>
                      ))}
                    </Pie>
                    <text 
                      x="50%" 
                      y="50%" 
                      textAnchor="middle" 
                      dominantBaseline="middle" 
                      fontSize="14" 
                      fontWeight="bold" 
                      fill="#333"
                    >
                      {title}
                    </text>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-gray-600 p-6" style={{ paddingTop: "390px", paddingLeft: "30px", height: "0px" }}>
            {[
              { key: "server_overall_status", title: "Server Overall Status" }
            ].map(({ key, title }) => (
              <div key={key} className="flex flex-col items-center bg-white shadow-lg rounded-xl p-6 " style={{ width: "430px" }}>
                <ResponsiveContainer width={370} height={370}>
                  <PieChart>
                    <Pie
                      data={processData(filteredTableData, key)}
                      cx="50%"
                      cy="50%"
                      innerRadius={100} 
                      outerRadius={140}
                      dataKey="value"
                      stroke="none"
                      paddingAngle={4}
                      cornerRadius={8} 
                    >
                      {processData(filteredTableData, key).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} onClick={() => {
                          localStorage.setItem('store', entry.store); // Save for later fallback
                          navigate('/server_status', {
                            state: {
                              store: entry.store,
                              date: getTodayDate(),
                              status:entry.status,
                              autoNavigateToTab2: true,
                            },
                          });
                        }}/>
                      ))}
                    </Pie>
                    <text 
                      x="50%" 
                      y="50%" 
                      textAnchor="middle" 
                      dominantBaseline="middle" 
                      fontSize="14" 
                      fontWeight="bold" 
                      fill="#333"
                    >
                      {title}
                    </text>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-gray-600 p-6" style={{ paddingTop: "0px", paddingLeft: "470px", height: "0px" }}>
            {[
              { key: "ind_backup_overall_status", title: "Ind Store Backup Overall" }
            ].map(({ key, title }) => (
              <div key={key} className="flex flex-col items-center bg-white shadow-lg rounded-xl p-6 " style={{ width: "430px" }}>
                <ResponsiveContainer width={370} height={370}>
                  <PieChart>
                    <Pie
                      data={processData(filteredTableData, key)}
                      cx="50%"
                      cy="50%"
                      innerRadius={100} 
                      outerRadius={140}
                      dataKey="value"
                      stroke="none"
                      paddingAngle={4}
                      cornerRadius={8} 
                    >
                      {processData(filteredTableData, key).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} onClick={() => {
                          localStorage.setItem('store', entry.store); 
                          navigate('/ind_store_backup_status', {
                            state: {
                              store: entry.store,
                              date: getTodayDate(),
                              status:entry.status,
                              autoNavigateToTab2: true,
                            },
                          });
                        }} />
                      ))}
                    </Pie>
                    <text 
                      x="50%" 
                      y="50%" 
                      textAnchor="middle" 
                      dominantBaseline="middle" 
                      fontSize="14" 
                      fontWeight="bold" 
                      fill="#333"
                    >
                      {title}
                    </text>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
          <div
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-gray-600 p-6"
            style={{ paddingTop: "0px", paddingLeft: "910px", height: "0px" }}
          >
            {[
              { key: "acronics_overall_status", title: "Acronics Backup Overall" }
            ].map(({ key, title }) => {
              // Filter out store 9820
              const filteredPieData = filteredTableData.filter(item => item.store !== "9820");

              return (
                <div
                  key={key}
                  className="flex flex-col items-center bg-white shadow-lg rounded-xl p-6"
                  style={{ width: "365px" }}
                >
                  <ResponsiveContainer width={370} height={370}>
                    <PieChart>
                      <Pie
                        data={processData(filteredPieData, key)}
                        cx="50%"
                        cy="50%"
                        innerRadius={100}
                        outerRadius={140}
                        dataKey="value"
                        stroke="none"
                        paddingAngle={4}
                        cornerRadius={8}
                      >
                        {processData(filteredPieData, key).map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                            onClick={() => {
                              localStorage.setItem('store', entry.store); // Save for later fallback
                              navigate('/acronics_backup_status', {
                                state: {
                                  store: entry.store,
                                  date: getTodayDate(),
                                  status:entry.status,
                                  autoNavigateToTab2: true,
                                },
                              });
                            }}
                          />
                        ))}
                      </Pie>
                      <text
                        x="50%"
                        y="50%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="14"
                        fontWeight="bold"
                        fill="#333"
                      >
                        {title}
                      </text>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              );
            })}
          </div>
          <div
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-gray-600 p-6"
            style={{ paddingTop: "0px", paddingLeft: "1285px", height: "0px" }}
          >
            {[
              { key: "sales_overall_status", title: "Sale Overall Status" }
            ].map(({ key, title }) => {
              // Exclude store 9820
              const filteredPieData = filteredTableData.filter(item => item.store !== "9820");

              return (
                <div
                  key={key}
                  className="flex flex-col items-center bg-white shadow-lg rounded-xl p-6"
                  style={{ width: "365px" }}
                >
                  <ResponsiveContainer width={370} height={370}>
                    <PieChart>
                      <Pie
                        data={processData(filteredPieData, key)}
                        cx="50%"
                        cy="50%"
                        innerRadius={100}
                        outerRadius={140}
                        dataKey="value"
                        stroke="none"
                        paddingAngle={4}
                        cornerRadius={8}
                      >
                        {processData(filteredPieData, key).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} onClick={() => {
                            localStorage.setItem('store', entry.store); // Save for later fallback
                            navigate('/sales_status', {
                              state: {
                                store: entry.store,
                                date: getYesterdayDate(),
                                status:entry.status,
                                autoNavigateToTab2: true,
                              },
                            });
                          }}/>
                        ))}
                      </Pie>
                      <text
                        x="50%"
                        y="50%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="14"
                        fontWeight="bold"
                        fill="#333"
                      >
                        {title}
                      </text>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              );
            })}
          </div>
          <div
            className="grid grid-cols-1 lg:grid-cols-2 bg-gray-600 gap-6"
            style={{ paddingTop: "390px", paddingLeft: "30px", height: "0px", width: "0px" }}
          >
            {["pos", "pdt", "server", "acronics"].map((category) => {
              let chartData = filteredData;

              if (["pos", "pdt", "acronics"].includes(category)) {
                chartData = chartData.filter((item) => item.store !== "9820");
              }

              if (category === "pdt") {
                chartData = chartData.filter((item) => item.store !== "9250" && item.store !== "9220");
              }

              return (
                <div
                  key={category}
                  className="w-full bg-white shadow-lg rounded-xl p-4"
                  style={{ width: "430px", height: "auto", overflow: "auto" }}
                >
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">
                    {category.replace(/_/g, " ").toUpperCase()}
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={chartData}
                      margin={{ top: -10, right: 10, left: -15, bottom: -5 }}
                      barGap={6}
                      barCategoryGap={10}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                      <XAxis
                        dataKey="store"
                        type="category"
                        tick={{ fill: "#555", fontSize: 12, fontWeight: 600 }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: "#555", fontSize: 12, fontWeight: 600 }}
                        domain={["auto", "auto"]}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          borderRadius: "8px",
                          border: "1px solid #ddd",
                          fontSize: "12px",
                        }}
                        cursor={{ fill: "rgba(0, 0, 0, 0.1)" }}
                      />
                      <Legend verticalAlign="top" height={36} />
                      <Bar
                        dataKey={`${category}_ok`}
                        stackId="a"
                        fill={colors[`${category}_ok`]}
                        radius={[5, 5, 0, 0]}
                        barSize={10}
                        onClick={(data) => {
                          handleBarClick(category, data, "ok");
                        }}
                      />
                      <Bar
                        dataKey={`${category}_not_ok`}
                        stackId="a"
                        fill={colors[`${category}_not_ok`]}
                        radius={[5, 5, 0, 0]}
                        barSize={10}
                        onClick={(data) => {
                          handleBarClick(category, data, "not ok");
                        }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              );
            })}
          </div>
        </div>
          <div
            className="grid grid-cols-1 lg:grid-cols-2 g-gray-200 gap-6"
            style={{ paddingLeft: "470px", height: "0px", width: "0px" }}
          >
            {["scale", "ups", "ind_backup", "sales"].map((category) => {
              const chartData =
                category === "scale"
                  ? filteredData.filter(
                      (item) =>
                        item.store !== "9250" &&
                        item.store !== "9220" &&
                        item.store !== "9820"
                    )
                  : category === "sales"
                  ? filteredData.filter((item) => item.store !== "9820")
                  : filteredData;

              return (
                <div
                  key={category}
                  className="w-full bg-white shadow-lg rounded-xl p-4"
                  style={{ width: "430px", height: "auto", overflow: "auto" }}
                >
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">
                    {category.replace(/_/g, " ").toUpperCase()}
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={chartData}
                      margin={{ top: -10, right: 10, left: -15, bottom: -5 }}
                      barGap={6}
                      barCategoryGap={10}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                      <XAxis
                        dataKey="store"
                        type="category"
                        tick={{ fill: "#555", fontSize: 12, fontWeight: 600 }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: "#555", fontSize: 12, fontWeight: 600 }}
                        domain={["auto", "auto"]}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          borderRadius: "8px",
                          border: "1px solid #ddd",
                          fontSize: "12px",
                        }}
                        cursor={{ fill: "rgba(0, 0, 0, 0.1)" }}
                      />
                      <Legend verticalAlign="top" height={36} />
                      <Bar
                        dataKey={`${category}_ok`}
                        stackId="a"
                        fill={colors[`${category}_ok`]}
                        radius={[5, 5, 0, 0]}
                        barSize={10}
                        onClick={(data) => {
                          handleBarClick(category, data, "ok");
                        }}
                      />
                      <Bar
                        dataKey={`${category}_not_ok`}
                        stackId="a"
                        fill={colors[`${category}_not_ok`]}
                        radius={[5, 5, 0, 0]}
                        barSize={10}
                        onClick={(data) => {
                          handleBarClick(category, data, "not ok");
                        }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              );
            })}
          </div>
          <div className="p-6 min-h-screen bg-gray-100" style={{ paddingLeft: "910px", height: "0px", width: "0px" }}>
            <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-6">
              {tables.map(({ title, color, keyPrefix }) => {
                let tableData = filteredTableData;

                if (keyPrefix === "scale") {
                  tableData = filteredTableData.filter(
                    (store) => store.store !== "9250" && store.store !== "9220"  && store.store !== "9820"
                  );
                } else if (keyPrefix === "pos") {
                  tableData = filteredTableData.filter(
                    (store) => store.store !== "9820"
                  );
                }
               else if (keyPrefix === "plu2") {
                tableData = filteredTableData.filter(
                  (store) => store.store !== "9820"
                );
              }
              else if (keyPrefix === "zvchr") {
                tableData = filteredTableData.filter(
                  (store) => store.store !== "9820"
                );
              }

                return (
                  <div key={keyPrefix} className="bg-white shadow-lg rounded-xl p-3" style={{ width: "365px", height: "auto" }}>
                    <h2 className={`text-base font-semibold mb-2 text-${color}-700`}>{title}</h2>
                    <div className="overflow-x-auto">
                      <table className="w-full border border-gray-300 rounded-lg text-xs">
                        <thead>
                          <tr className={`bg-${color}-500 text-black text-xs`}>
                            <th className="px-2 py-1">Store</th>
                            <th className="px-2 py-1">Status</th>
                            <th className="px-2 py-1">Verified</th>
                            <th className="px-2 py-1">Total</th>
                            <th className="px-2 py-1">Verified</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tableData.length > 0 ? (
                            tableData.map((store, index) => (
                              <tr key={index}     onClick={() =>
                                handleRowClick(keyPrefix, store.store, store[`${keyPrefix}_status`])
                              } className="text-center border-b bg-gray-50 hover:bg-gray-100 text-xs">
                                <td className="px-2 py-1 font-medium">{store.store}</td>
                                <td className="px-2 py-1">{store[`${keyPrefix}_status`]}</td>
                                <td className="px-2 py-1">{store[`${keyPrefix}_verified`]}</td>
                                <td className="px-2 py-1">{store[`${keyPrefix}_count`]}</td>
                                <td className="px-2 py-1">{store[`${keyPrefix}_verified_count`]}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={7} className="px-2 py-1 text-center">No Data Available</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="p-6 min-h-screen bg-gray-100" style={{ paddingLeft: "1285px", height: "0px", width:"0px" }}>
            <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-6">
              {tables1.map(({ title, color, keyPrefix }) => {
                let tableData = filteredTableData;

                if (["sale", "pdt", "sale_status", "pos_performance", "acronics_backup"].includes(keyPrefix)) {
                  tableData = tableData.filter(store => store.store !== "9820");
                }

                if (keyPrefix === "pdt") {
                  tableData = tableData.filter(store => store.store !== "9250" && store.store !== "9220");
                }

                return (
                  <div key={keyPrefix} className="bg-white shadow-lg rounded-xl p-3" style={{ width: "365px", height: "auto" }}>
                    <h2 className={`text-base font-semibold mb-2 text-${color}-700`}>{title}</h2>
                    <div className="overflow-x-auto">
                      <table className="w-full border border-gray-300 rounded-lg text-xs">
                        <thead>
                          <tr className={`bg-${color}-500 text-black text-xs`}>
                            <th className="px-2 py-1">Store</th>
                            <th className="px-2 py-1">Status</th>
                            <th className="px-2 py-1">Verified</th>
                            <th className="px-2 py-1">Total</th>
                            <th className="px-2 py-1">Verified</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tableData.length > 0 ? (
                            tableData.map((store, index) => (
                              <tr key={index} onClick={() =>
                                handleRowClick(keyPrefix, store.store, store[`${keyPrefix}_status`])
                              } className="text-center border-b bg-gray-50 hover:bg-gray-100 text-xs">
                                <td className="px-2 py-1 font-medium">{store.store}</td>
                                <td className="px-2 py-1">{store[`${keyPrefix}_status`]}</td>
                                <td className="px-2 py-1">{store[`${keyPrefix}_verified`]}</td>
                                <td className="px-2 py-1">{store[`${keyPrefix}_count`]}</td>
                                <td className="px-2 py-1">{store[`${keyPrefix}_verified_count`]}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={7} className="px-2 py-1 text-center">No Data Available</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}

            </div>
          </div>

      </>
    )};

  if (userGroup === "Management_User") {
    return(
      <>
        <div className="p-6 min-h-screen bg-gray-100">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Store Status Overview</h2>
          <div className="mb-4 flex items-center gap-3">
            <label htmlFor="storeFilter" className="text-sm font-semibold text-gray-800 whitespace-nowrap">
              Select Store:  
            </label>
            <select
              id="storeFilter"
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="p-3 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:shadow-md transition duration-200"
            >
              {storeNames
              .filter((store) => store !== "9000")
              .map((store) => (
                <option key={store} value={store} className="text-gray-900">
                  {store}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-gray-600 p-6" style={{ paddingLeft: "30px", height: "0px" }}>
            {[
              { key: "plu2Status", title: "PLU2 Status" }
            ].map(({ key, title }) => (
              <div key={key} className="flex flex-col items-center bg-white shadow-lg rounded-xl p-6 " style={{ width: "430px" }}>
                <ResponsiveContainer width={370} height={370}>
                  <PieChart>
                    <Pie
                      data={processData(filteredTableData.filter(item => item.store !== "9820"), key)}
                      cx="50%"
                      cy="50%"
                      innerRadius={100}
                      outerRadius={140}
                      dataKey="value"
                      stroke="none"
                      paddingAngle={4}
                      cornerRadius={8}
                    >
                      {processData(filteredTableData.filter(item => item.store !== "9820"), key).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <text
                      x="50%"
                      y="50%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="14"
                      fontWeight="bold"
                      fill="#333"
                    >
                      {title}
                    </text>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 bg-gray-600 gap-6" style={{ paddingLeft: "470px", height: "0px" }}>
            {[
              { key: "eodStatus", title: "EOD Final Status" },
            ].map(({ key, title }) => (
              <div key={key} className="flex flex-col items-center bg-white shadow-lg rounded-xl p-6" style={{ width: "430px" }}>
                <ResponsiveContainer width={370} height={370}>
                  <PieChart>
                    <Pie
                      data={processData(filteredTableData.filter(item => item.store !== "9820"), key)}
                      cx="50%"
                      cy="50%"
                      innerRadius={100} 
                      outerRadius={140}
                      dataKey="value"
                      stroke="none"
                      paddingAngle={4}
                      cornerRadius={8} 
                    >
                      {processData(filteredTableData.filter(item => item.store !== "9820"), key).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    {/* Title inside the donut chart */}
                    <text 
                      x="50%" 
                      y="50%" 
                      textAnchor="middle" 
                      dominantBaseline="middle" 
                      fontSize="14" 
                      fontWeight="bold" 
                      fill="#333"
                    >
                      {title}
                    </text>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 bg-gray-600 gap-6" style={{ paddingLeft: "910px", height: "0px" }}>
            {[
              { key: "idocFileStatus", title: "IDoc File Upload Status" },
            ].map(({ key, title }) => (
              <div key={key} className="flex flex-col items-center bg-white shadow-lg rounded-xl p-6" style={{ width: "365px" }}>
                <ResponsiveContainer width={370} height={370}>
                  <PieChart>
                    <Pie
                      data={processData(filteredTableData.filter(item => item.store !== "9820"), key)}
                      cx="50%"
                      cy="50%"
                      innerRadius={100} 
                      outerRadius={140}
                      dataKey="value"
                      stroke="none"
                      paddingAngle={4}
                      cornerRadius={8} 
                    >
                      {processData(filteredTableData.filter(item => item.store !== "9820"), key).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    {/* Title inside the donut chart */}
                    <text 
                      x="50%" 
                      y="50%" 
                      textAnchor="middle" 
                      dominantBaseline="middle" 
                      fontSize="14" 
                      fontWeight="bold" 
                      fill="#333"
                    >
                      {title}
                    </text>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 bg-gray-600 gap-6" style={{ paddingLeft: "1285px"}}>
            {[
              {key: "folderStatus", title: "PLU2 Containing Folder"},
            ].map(({ key, title }) => (
              <div key={key} className="flex flex-col items-center bg-white shadow-lg rounded-xl p-6" style={{ width: "365px" }}>
                <ResponsiveContainer width={370} height={370}>
                  <PieChart>
                    <Pie
                      data={processData(filteredTableData.filter(item => item.store !== "9820"), key)}
                      cx="50%"
                      cy="50%"
                      innerRadius={100} 
                      outerRadius={140}
                      dataKey="value"
                      stroke="none"
                      paddingAngle={4}
                      cornerRadius={8} 
                    >
                      {processData(filteredTableData.filter(item => item.store !== "9820"), key).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    {/* Title inside the donut chart */}
                    <text 
                      x="50%" 
                      y="50%" 
                      textAnchor="middle" 
                      dominantBaseline="middle" 
                      fontSize="14" 
                      fontWeight="bold" 
                      fill="#333"
                    >
                      {title}
                    </text>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap justify-center p-6 bg-gray-100" style={{  paddingTop: "20px", paddingLeft: "30px", height: "0px" }}>
            <div className="grid grid-cols-3 gap-4 mb-6 w-full">
              {[
                { title: "Total Payment", key: "totalpayment" },
                { title: "Expected Payment", key: "expectedpayment" },
                { title: "Actual Payment", key: "actualpayment" },
                { title: "Cashier Short/Excess", key: "cashiershortexcess" },
              ].map((item, index) => (
                <div key={index} className="bg-white shadow-lg rounded-xl p-4 text-center" style={{ width: "210px", height: "150px" }}>
                  <h4 className="text-lg font-semibold text-gray-700">{item.title}</h4>
                  <p className="text-xl font-bold text-blue-600">
                  {summaryData[item.key] !== undefined ? summaryData[item.key].toLocaleString() : "--"}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap justify-center p-6 bg-gray-100" style={{ paddingLeft: "250px", height: "0px" }}>
            <div className="grid grid-cols-3 gap-4 mb-6 w-full">
              {[
                { title: "ZDSR", key: "zdsr" },
                { title: "Z-Read", key: "zread" },
                { title: "ZDSR - ZRead", key: "zdsrzread" },
                { title: "ZPMC Difference", key: "zpmc" },
              ].map((item, index) => (
                <div key={index} className="bg-white shadow-lg rounded-xl p-4 text-center" style={{ width: "210px", height: "150px" }}>
                  <h4 className="text-lg font-semibold text-gray-700">{item.title}</h4>
                  <p className="text-xl font-bold text-blue-600">
                  {summaryData[item.key] !== undefined ? summaryData[item.key].toLocaleString() : "--"}
                  </p>
                </div>
              ))}
            </div>      
          </div>
          <div className="flex flex-wrap justify-center p-6 bg-gray-100" style={{ paddingLeft: "470px" }}>
            <div className="w-full bg-white shadow-lg rounded-xl p-6" style={{ width: "1180px" }}>
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Sales</h3>

              {/* Filter out store 9820 */}
              <ResponsiveContainer width="100%" height={540}>
                <LineChart
                  data={filteredData.filter(item => item.store !== "9820")}
                  margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                  <XAxis dataKey="store" tick={{ fill: "#555", fontSize: 12, fontWeight: 600 }} />
                  <YAxis tick={{ fill: "#555", fontSize: 12, fontWeight: 600 }} domain={["auto", "auto"]} />
                  <Tooltip contentStyle={{ backgroundColor: "white", borderRadius: "8px", border: "1px solid #ddd", fontSize: "12px" }} />
                  <Legend verticalAlign="top" height={36} />

                  <Line type="monotone" dataKey="zdsr" stroke="#ff7300" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="zread" stroke="#0088FE" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="totalpayment" stroke="#8884d8" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="expectedpayment" stroke="#387908" strokeWidth={2} dot={false} />

                  {/* Dots and warnings */}
                  {filteredData.filter(item => item.store !== "9820").map((item, index) => {
                    const isWarning = !(item.zdsr === item.zread && item.zread === item.totalpayment && item.totalpayment === item.expectedpayment);
                    const isAllZero = item.zdsr === 0 && item.zread === 0 && item.totalpayment === 0 && item.expectedpayment === 0;
                    const isEqual = item.zdsr === item.zread && item.zread === item.totalpayment && item.totalpayment === item.expectedpayment;

                    return (
                      <React.Fragment key={`dots-${index}`}>
                        {isWarning && (
                          <ReferenceDot
                            x={item.store}
                            y={Math.max(item.zdsr, item.zread, item.totalpayment, item.expectedpayment)}
                            r={10}
                            fill="#e15759"
                            stroke="black"
                          >
                            <Label
                              value="⚠️"
                              position="top"
                              fill="#e15759"
                              fontSize={16}
                              fontWeight="bold"
                            />
                          </ReferenceDot>
                        )}
                        {isEqual && (
                          <ReferenceDot
                            x={item.store}
                            y={item.zdsr}
                            r={6}
                            fill="#28A745"
                            stroke="black"
                          >
                            <Label
                              fill="#28A745"
                              fontSize={16}
                              fontWeight="bold"
                            />
                          </ReferenceDot>
                        )}
                        {isAllZero && (
                          <ReferenceDot
                            x={item.store}
                            y={0}
                            r={1}
                            fill="#0000FF"
                            stroke="black"
                          >
                            <Label
                              value="🔵"
                              fontSize={14}
                              fontWeight="bold"
                            />
                          </ReferenceDot>
                        )}
                      </React.Fragment>
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-gray-600 p-6"
            style={{ paddingTop: "20px", paddingLeft: "30px", height: "0px" }}
          >
            {[
              { key: "pos_overall_status", title: "POS Overall Status" }
            ].map(({ key, title }) => {
              const filteredPieData = filteredTableData.filter(item => item.store !== "9820");

              return (
                <div
                  key={key}
                  className="flex flex-col items-center bg-white shadow-lg rounded-xl p-6"
                  style={{ width: "430px" }}
                >
                  <ResponsiveContainer width={370} height={370}>
                    <PieChart>
                      <Pie
                        data={processData(filteredPieData, key)}
                        cx="50%"
                        cy="50%"
                        innerRadius={100}
                        outerRadius={140}
                        dataKey="value"
                        stroke="none"
                        paddingAngle={4}
                        cornerRadius={8}
                      >
                        {processData(filteredPieData, key).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <text
                        x="50%"
                        y="50%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="14"
                        fontWeight="bold"
                        fill="#333"
                      >
                        {title}
                      </text>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              );
            })}
          </div>
          <div
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-gray-600 p-6"
            style={{ paddingTop: "0px", paddingLeft: "470px", height: "0px" }}
          >
            {[
              { key: "scale_overall_status", title: "Scale Overall Status" }
            ].map(({ key, title }) => {
              // Apply conditional filtering
              const data =
                key === "scale_overall_status"
                  ? filteredTableData.filter(
                      (item) => item.store !== "9250" && item.store !== "9220" && item.store !== "9820"
                    )
                  : filteredTableData;

              return (
                <div
                  key={key}
                  className="flex flex-col items-center bg-white shadow-lg rounded-xl p-6"
                  style={{ width: "430px" }}
                >
                  <ResponsiveContainer width={370} height={370}>
                    <PieChart>
                      <Pie
                        data={processData(data, key)}
                        cx="50%"
                        cy="50%"
                        innerRadius={100}
                        outerRadius={140}
                        dataKey="value"
                        stroke="none"
                        paddingAngle={4}
                        cornerRadius={8}
                      >
                        {processData(data, key).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <text
                        x="50%"
                        y="50%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="14"
                        fontWeight="bold"
                        fill="#333"
                      >
                        {title}
                      </text>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              );
            })}
          </div>
          <div
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-gray-600 p-6"
            style={{ paddingTop: "0px", paddingLeft: "910px", height: "0px" }}
          >
            {[
              { key: "pdt_overall_status", title: "PDT Overall Status" }
            ].map(({ key, title }) => {
              const filteredPieData = filteredTableData.filter(item => item.store !== "9250" && item.store !== "9220" && item.store !== "9820");

              return (
                <div
                  key={key}
                  className="flex flex-col items-center bg-white shadow-lg rounded-xl p-6"
                  style={{ width: "365px" }}
                >
                  <ResponsiveContainer width={370} height={370}>
                    <PieChart>
                      <Pie
                        data={processData(filteredPieData, key)}
                        cx="50%"
                        cy="50%"
                        innerRadius={100}
                        outerRadius={140}
                        dataKey="value"
                        stroke="none"
                        paddingAngle={4}
                        cornerRadius={8}
                      >
                        {processData(filteredPieData, key).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <text
                        x="50%"
                        y="50%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="14"
                        fontWeight="bold"
                        fill="#333"
                      >
                        {title}
                      </text>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-gray-600 p-6" style={{ paddingTop: "0px", paddingLeft: "1285px", height: "0px" }}>
            {[
              { key: "ups_overall_status", title: "UPS AMC Overall Status" }
            ].map(({ key, title }) => (
              <div key={key} className="flex flex-col items-center bg-white shadow-lg rounded-xl p-6 " style={{ width: "365px" }}>
                <ResponsiveContainer width={370} height={370}>
                  <PieChart>
                    <Pie
                      data={processData(filteredTableData, key)}
                      cx="50%"
                      cy="50%"
                      innerRadius={100} 
                      outerRadius={140}
                      dataKey="value"
                      stroke="none"
                      paddingAngle={4}
                      cornerRadius={8} 
                    >
                      {processData(filteredTableData, key).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <text 
                      x="50%" 
                      y="50%" 
                      textAnchor="middle" 
                      dominantBaseline="middle" 
                      fontSize="14" 
                      fontWeight="bold" 
                      fill="#333"
                    >
                      {title}
                    </text>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-gray-600 p-6" style={{ paddingTop: "390px", paddingLeft: "30px", height: "0px" }}>
            {[
              { key: "server_overall_status", title: "Server Overall Status" }
            ].map(({ key, title }) => (
              <div key={key} className="flex flex-col items-center bg-white shadow-lg rounded-xl p-6 " style={{ width: "430px" }}>
                <ResponsiveContainer width={370} height={370}>
                  <PieChart>
                    <Pie
                      data={processData(filteredTableData, key)}
                      cx="50%"
                      cy="50%"
                      innerRadius={100} 
                      outerRadius={140}
                      dataKey="value"
                      stroke="none"
                      paddingAngle={4}
                      cornerRadius={8} 
                    >
                      {processData(filteredTableData, key).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <text 
                      x="50%" 
                      y="50%" 
                      textAnchor="middle" 
                      dominantBaseline="middle" 
                      fontSize="14" 
                      fontWeight="bold" 
                      fill="#333"
                    >
                      {title}
                    </text>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-gray-600 p-6" style={{ paddingTop: "0px", paddingLeft: "470px", height: "0px" }}>
            {[
              { key: "ind_backup_overall_status", title: "Ind Store Backup Overall" }
            ].map(({ key, title }) => (
              <div key={key} className="flex flex-col items-center bg-white shadow-lg rounded-xl p-6 " style={{ width: "430px" }}>
                <ResponsiveContainer width={370} height={370}>
                  <PieChart>
                    <Pie
                      data={processData(filteredTableData, key)}
                      cx="50%"
                      cy="50%"
                      innerRadius={100} 
                      outerRadius={140}
                      dataKey="value"
                      stroke="none"
                      paddingAngle={4}
                      cornerRadius={8} 
                    >
                      {processData(filteredTableData, key).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <text 
                      x="50%" 
                      y="50%" 
                      textAnchor="middle" 
                      dominantBaseline="middle" 
                      fontSize="14" 
                      fontWeight="bold" 
                      fill="#333"
                    >
                      {title}
                    </text>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-gray-600 p-6" style={{ paddingTop: "0px", paddingLeft: "910px", height: "0px" }}>
            {[
              { key: "acronics_overall_status", title: "Acronics Backup Overall" }
            ].map(({ key, title }) => (
              <div key={key} className="flex flex-col items-center bg-white shadow-lg rounded-xl p-6 " style={{ width: "365px" }}>
                <ResponsiveContainer width={370} height={370}>
                  <PieChart>
                    <Pie
                      data={processData(filteredTableData, key)}
                      cx="50%"
                      cy="50%"
                      innerRadius={100} 
                      outerRadius={140}
                      dataKey="value"
                      stroke="none"
                      paddingAngle={4}
                      cornerRadius={8} 
                    >
                      {processData(filteredTableData, key).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <text 
                      x="50%" 
                      y="50%" 
                      textAnchor="middle" 
                      dominantBaseline="middle" 
                      fontSize="14" 
                      fontWeight="bold" 
                      fill="#333"
                    >
                      {title}
                    </text>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
          <div
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-gray-600 p-6"
            style={{ paddingTop: "0px", paddingLeft: "1285px", height: "0px" }}
          >
            {[
              { key: "sales_overall_status", title: "Sale Overall Status" }
            ].map(({ key, title }) => {
              // Exclude store 9820
              const filteredPieData = filteredTableData.filter(item => item.store !== "9820");

              return (
                <div
                  key={key}
                  className="flex flex-col items-center bg-white shadow-lg rounded-xl p-6"
                  style={{ width: "365px" }}
                >
                  <ResponsiveContainer width={370} height={370}>
                    <PieChart>
                      <Pie
                        data={processData(filteredPieData, key)}
                        cx="50%"
                        cy="50%"
                        innerRadius={100}
                        outerRadius={140}
                        dataKey="value"
                        stroke="none"
                        paddingAngle={4}
                        cornerRadius={8}
                      >
                        {processData(filteredPieData, key).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <text
                        x="50%"
                        y="50%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="14"
                        fontWeight="bold"
                        fill="#333"
                      >
                        {title}
                      </text>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              );
            })}
          </div>
          <div
            className="grid grid-cols-1 lg:grid-cols-2 bg-gray-600 gap-6"
            style={{ paddingTop: "390px", paddingLeft: "30px", height: "0px", width: "0px" }}
          >
            {["pos", "pdt", "server", "acronics"].map((category) => {
              let chartData = filteredData;

              if (category === "pos") {
                chartData = chartData.filter((item) => item.store !== "9820");
              }

              if (category === "pdt") {
                chartData = chartData.filter(
                  (item) => !["9820", "9250", "9220"].includes(item.store)
                );
              }

              return (
                <div
                  key={category}
                  className="w-full bg-white shadow-lg rounded-xl p-4"
                  style={{ width: "430px", height: "auto", overflow: "auto" }}
                >
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">
                    {category.replace(/_/g, " ").toUpperCase()}
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={chartData}
                      margin={{ top: -10, right: 10, left: -15, bottom: -5 }}
                      barGap={6}
                      barCategoryGap={10}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                      <XAxis
                        dataKey="store"
                        type="category"
                        tick={{ fill: "#555", fontSize: 12, fontWeight: 600 }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: "#555", fontSize: 12, fontWeight: 600 }}
                        domain={["auto", "auto"]}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          borderRadius: "8px",
                          border: "1px solid #ddd",
                          fontSize: "12px",
                        }}
                        cursor={{ fill: "rgba(0, 0, 0, 0.1)" }}
                      />
                      <Legend verticalAlign="top" height={36} />
                      <Bar
                        dataKey={`${category}_ok`}
                        stackId="a"
                        fill={colors[`${category}_ok`]}
                        radius={[5, 5, 0, 0]}
                        barSize={10}
                      />
                      <Bar
                        dataKey={`${category}_not_ok`}
                        stackId="a"
                        fill={colors[`${category}_not_ok`]}
                        radius={[5, 5, 0, 0]}
                        barSize={10}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              );
            })}

          </div>
        </div>
          <div
            className="grid grid-cols-1 lg:grid-cols-2 g-gray-200 gap-6"
            style={{ paddingLeft: "470px", height: "0px", width: "0px" }}
          >
            {["scale", "ups", "ind_backup", "sales"].map((category) => {
              // Conditionally filter data for scale and sales
              const chartData =
                category === "scale"
                  ? filteredData.filter(
                      (item) =>
                        item.store !== "9250" &&
                        item.store !== "9220" &&
                        item.store !== "9820"
                    )
                  : category === "sales"
                  ? filteredData.filter((item) => item.store !== "9820")
                  : filteredData;

              return (
                <div
                  key={category}
                  className="w-full bg-white shadow-lg rounded-xl p-4"
                  style={{ width: "430px", height: "auto", overflow: "auto" }}
                >
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">
                    {category.replace(/_/g, " ").toUpperCase()}
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={chartData}
                      margin={{ top: -10, right: 10, left: -15, bottom: -5 }}
                      barGap={6}
                      barCategoryGap={10}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                      <XAxis
                        dataKey="store"
                        type="category"
                        tick={{ fill: "#555", fontSize: 12, fontWeight: 600 }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: "#555", fontSize: 12, fontWeight: 600 }}
                        domain={["auto", "auto"]}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          borderRadius: "8px",
                          border: "1px solid #ddd",
                          fontSize: "12px",
                        }}
                        cursor={{ fill: "rgba(0, 0, 0, 0.1)" }}
                      />
                      <Legend verticalAlign="top" height={36} />
                      <Bar
                        dataKey={`${category}_ok`}
                        stackId="a"
                        fill={colors[`${category}_ok`]}
                        radius={[5, 5, 0, 0]}
                        barSize={10}
                      />
                      <Bar
                        dataKey={`${category}_not_ok`}
                        stackId="a"
                        fill={colors[`${category}_not_ok`]}
                        radius={[5, 5, 0, 0]}
                        barSize={10}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              );
            })}
          </div>
          <div className="p-6 min-h-screen bg-gray-100" style={{ paddingLeft: "910px", height: "0px", width: "0px" }}>
            <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-6">
              {tables.map(({ title, color, keyPrefix }) => {
                let tableData = filteredTableData;

                if (keyPrefix === "scale") {
                  tableData = filteredTableData.filter(
                    (store) => store.store !== "9250" && store.store !== "9220"  && store.store !== "9820"
                  );
                } else if (keyPrefix === "pos") {
                  tableData = filteredTableData.filter(
                    (store) => store.store !== "9820"
                  );
                }

                return (
                  <div key={keyPrefix} className="bg-white shadow-lg rounded-xl p-3" style={{ width: "365px", height: "auto" }}>
                    <h2 className={`text-base font-semibold mb-2 text-${color}-700`}>{title}</h2>
                    <div className="overflow-x-auto">
                      <table className="w-full border border-gray-300 rounded-lg text-xs">
                        <thead>
                          <tr className={`bg-${color}-500 text-black text-xs`}>
                            <th className="px-2 py-1">Store</th>
                            <th className="px-2 py-1">Status</th>
                            <th className="px-2 py-1">Verified</th>
                            <th className="px-2 py-1">Total</th>
                            <th className="px-2 py-1">Verified</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tableData.length > 0 ? (
                            tableData.map((store, index) => (
                              <tr key={index} className="text-center border-b bg-gray-50 hover:bg-gray-100 text-xs">
                                <td className="px-2 py-1 font-medium">{store.store}</td>
                                <td className="px-2 py-1">{store[`${keyPrefix}_status`]}</td>
                                <td className="px-2 py-1">{store[`${keyPrefix}_verified`]}</td>
                                <td className="px-2 py-1">{store[`${keyPrefix}_count`]}</td>
                                <td className="px-2 py-1">{store[`${keyPrefix}_verified_count`]}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={7} className="px-2 py-1 text-center">No Data Available</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="p-6 min-h-screen bg-gray-100" style={{ paddingLeft: "1285px", height: "0px", width:"0px" }}>
            <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-6">
              {tables1.map(({ title, color, keyPrefix }) => {
                const excludeStores = ["sale", "pdt", "sale_status", "pos_performance"];
                let tableData = excludeStores.includes(keyPrefix)
                  ? filteredTableData.filter(store => store.store !== "9820")
                  : filteredTableData;

                if (keyPrefix === "pdt") {
                  tableData = tableData.filter(store => store.store !== "9250" && store.store !== "9220");
                }

                return (
                  <div key={keyPrefix} className="bg-white shadow-lg rounded-xl p-3" style={{ width: "365px", height: "auto" }}>
                    <h2 className={`text-base font-semibold mb-2 text-${color}-700`}>{title}</h2>
                    <div className="overflow-x-auto">
                      <table className="w-full border border-gray-300 rounded-lg text-xs">
                        <thead>
                          <tr className={`bg-${color}-500 text-black text-xs`}>
                            <th className="px-2 py-1">Store</th>
                            <th className="px-2 py-1">Status</th>
                            <th className="px-2 py-1">Verified</th>
                            <th className="px-2 py-1">Total</th>
                            <th className="px-2 py-1">Verified</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tableData.length > 0 ? (
                            tableData.map((store, index) => (
                              <tr
                                key={index}
                                className="text-center border-b bg-gray-50 hover:bg-gray-100 text-xs"
                              >
                                <td className="px-2 py-1 font-medium">{store.store}</td>
                                <td className="px-2 py-1">{store[`${keyPrefix}_status`]}</td>
                                <td className="px-2 py-1">{store[`${keyPrefix}_verified`]}</td>
                                <td className="px-2 py-1">{store[`${keyPrefix}_count`]}</td>
                                <td className="px-2 py-1">{store[`${keyPrefix}_verified_count`]}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={7} className="px-2 py-1 text-center">No Data Available</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

      </>
    )};
  
  if (userGroup === "End_User") {
    return(
      <>
        <div className="p-6 min-h-screen bg-gray-100">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Store Status Overview</h2>
          <div className="mb-4 flex items-center gap-3">
            <label htmlFor="storeFilter" className="text-sm font-semibold text-gray-800 whitespace-nowrap">
              Select Store:  
            </label>
            <select
              id="storeFilter"
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="p-3 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:shadow-md transition duration-200"
            >
              {storeNames.map((store) => (
                <option key={store} value={store} className="text-gray-900">
                  {store}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-gray-600 p-6" style={{ paddingLeft: "30px", height: "0px" }}>
            {[
              { key: "plu2Status", title: "PLU2 Status" }
            ].map(({ key, title }) => (
              <div key={key} className="flex flex-col items-center bg-white shadow-lg rounded-xl p-6 " style={{ width: "430px" }}>
                <ResponsiveContainer width={370} height={370}>
                  <PieChart>
                    <Pie
                      data={processData(filteredTableData, key)}
                      cx="50%"
                      cy="50%"
                      innerRadius={100} 
                      outerRadius={140}
                      dataKey="value"
                      stroke="none"
                      paddingAngle={4}
                      cornerRadius={8} 
                    >
                      {processData(filteredTableData, key).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    {/* Title inside the donut chart */}
                    <text 
                      x="50%" 
                      y="50%" 
                      textAnchor="middle" 
                      dominantBaseline="middle" 
                      fontSize="14" 
                      fontWeight="bold" 
                      fill="#333"
                    >
                      {title}
                    </text>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 bg-gray-600 gap-6" style={{ paddingLeft: "470px", height: "0px" }}>
            {[
              { key: "eodStatus", title: "EOD Final Status" },
            ].map(({ key, title }) => (
              <div key={key} className="flex flex-col items-center bg-white shadow-lg rounded-xl p-6" style={{ width: "430px" }}>
                <ResponsiveContainer width={370} height={370}>
                  <PieChart>
                    <Pie
                      data={processData(filteredTableData, key)}
                      cx="50%"
                      cy="50%"
                      innerRadius={100} 
                      outerRadius={140}
                      dataKey="value"
                      stroke="none"
                      paddingAngle={4}
                      cornerRadius={8} 
                    >
                      {processData(filteredTableData, key).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    {/* Title inside the donut chart */}
                    <text 
                      x="50%" 
                      y="50%" 
                      textAnchor="middle" 
                      dominantBaseline="middle" 
                      fontSize="14" 
                      fontWeight="bold" 
                      fill="#333"
                    >
                      {title}
                    </text>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 bg-gray-600 gap-6" style={{ paddingLeft: "910px", height: "0px" }}>
            {[
              { key: "idocFileStatus", title: "IDoc File Upload Status" },
            ].map(({ key, title }) => (
              <div key={key} className="flex flex-col items-center bg-white shadow-lg rounded-xl p-6" style={{ width: "365px" }}>
                <ResponsiveContainer width={370} height={370}>
                  <PieChart>
                    <Pie
                      data={processData(filteredTableData, key)}
                      cx="50%"
                      cy="50%"
                      innerRadius={100} 
                      outerRadius={140}
                      dataKey="value"
                      stroke="none"
                      paddingAngle={4}
                      cornerRadius={8} 
                    >
                      {processData(filteredTableData, key).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    {/* Title inside the donut chart */}
                    <text 
                      x="50%" 
                      y="50%" 
                      textAnchor="middle" 
                      dominantBaseline="middle" 
                      fontSize="14" 
                      fontWeight="bold" 
                      fill="#333"
                    >
                      {title}
                    </text>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 bg-gray-600 gap-6" style={{ paddingLeft: "1285px"}}>
            {[
              {key: "folderStatus", title: "PLU2 Containing Folder"},
            ].map(({ key, title }) => (
              <div key={key} className="flex flex-col items-center bg-white shadow-lg rounded-xl p-6" style={{ width: "365px" }}>
                <ResponsiveContainer width={370} height={370}>
                  <PieChart>
                    <Pie
                      data={processData(filteredTableData, key)}
                      cx="50%"
                      cy="50%"
                      innerRadius={100} 
                      outerRadius={140}
                      dataKey="value"
                      stroke="none"
                      paddingAngle={4}
                      cornerRadius={8} 
                    >
                      {processData(filteredTableData, key).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    {/* Title inside the donut chart */}
                    <text 
                      x="50%" 
                      y="50%" 
                      textAnchor="middle" 
                      dominantBaseline="middle" 
                      fontSize="14" 
                      fontWeight="bold" 
                      fill="#333"
                    >
                      {title}
                    </text>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap justify-center p-6 bg-gray-100" style={{  paddingTop: "20px", paddingLeft: "30px", height: "0px" }}>
            <div className="grid grid-cols-3 gap-4 mb-6 w-full">
              {[
                { title: "Total Payment", key: "totalpayment" },
                { title: "Expected Payment", key: "expectedpayment" },
                { title: "Actual Payment", key: "actualpayment" },
                { title: "Cashier Short/Excess", key: "cashiershortexcess" },
              ].map((item, index) => (
                <div key={index} className="bg-white shadow-lg rounded-xl p-4 text-center" style={{ width: "210px", height: "150px" }}>
                  <h4 className="text-lg font-semibold text-gray-700">{item.title}</h4>
                  <p className="text-xl font-bold text-blue-600">
                  {summaryData[item.key] !== undefined ? summaryData[item.key].toLocaleString() : "--"}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap justify-center p-6 bg-gray-100" style={{ paddingLeft: "250px", height: "0px" }}>
            <div className="grid grid-cols-3 gap-4 mb-6 w-full">
              {[
                { title: "ZDSR", key: "zdsr" },
                { title: "Z-Read", key: "zread" },
                { title: "ZDSR - ZRead", key: "zdsrzread" },
                { title: "ZPMC Difference", key: "zpmc" },
              ].map((item, index) => (
                <div key={index} className="bg-white shadow-lg rounded-xl p-4 text-center" style={{ width: "210px", height: "150px" }}>
                  <h4 className="text-lg font-semibold text-gray-700">{item.title}</h4>
                  <p className="text-xl font-bold text-blue-600">
                  {summaryData[item.key] !== undefined ? summaryData[item.key].toLocaleString() : "--"}
                  </p>
                </div>
              ))}
            </div>      
          </div>
          <div className="flex flex-wrap justify-center p-6 bg-gray-100" style={{ paddingLeft: "470px"}}>
            <div className="w-full bg-white shadow-lg rounded-xl p-6" style={{ width: "1180px"}}>
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Sales</h3>
              <ResponsiveContainer width="100%" height={540}>
                <LineChart data={filteredData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                  <XAxis dataKey="store" tick={{ fill: "#555", fontSize: 12, fontWeight: 600 }} />
                  <YAxis tick={{ fill: "#555", fontSize: 12, fontWeight: 600 }} domain={["auto", "auto"]} />
                  <Tooltip contentStyle={{ backgroundColor: "white", borderRadius: "8px", border: "1px solid #ddd", fontSize: "12px" }} />
                  <Legend verticalAlign="top" height={36} />
  
                  <Line type="monotone" dataKey="zdsr" stroke="#ff7300" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="zread" stroke="#387908" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="totalpayment" stroke="#8884d8" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="expectedpayment" stroke="#0088FE" strokeWidth={2} dot={false} />
  
                  {/* Show warning if values are not equal */}
                  {filteredData.map((item, index) => {
                    const isWarning = !(item.zdsr === item.zread && item.zread === item.totalpayment && item.totalpayment === item.expectedpayment);
                    
                    return isWarning ? (
                      <ReferenceDot 
                        key={index}
                        x={item.store} 
                        y={Math.max(item.zdsr, item.zread, item.totalpayment, item.expectedpayment)} 
                        r={10} 
                        fill="#e15759" 
                        stroke="black"
                      >
                        <Label 
                          value="⚠️" 
                          position="top" 
                          fill="#e15759" 
                          fontSize={16} 
                          fontWeight="bold"
                        />
                      </ReferenceDot>
                    ) : null;
                  })}
                </LineChart>
  
              </ResponsiveContainer>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 bg-gray-600 gap-6" style={{  paddingTop: "20px", paddingLeft: "30px", height: "0px", width:"0px" }}>
            {["pos", "pdt", "server", "acronics"].map((category) => (
              <div key={category} className="w-full bg-white shadow-lg rounded-xl p-4" style={{ width: "430px", height: "auto" , overflow: "auto" }}>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">{category.replace(/_/g, " ").toUpperCase()}</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={filteredData} margin={{top: -10, right: 10, left: -15, bottom: -5}} barGap={6} barCategoryGap={10}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ddd" /> {/* Grid lines added */}
                    <XAxis dataKey="store" tick={{ fill: "#555", fontSize: 12, fontWeight: 600 }} tickLine={false} />
                    <YAxis tick={{ fill: "#555", fontSize: 12, fontWeight: 600 }} domain={['auto', 'auto']} ticks={[5, 10, 15, 20, 25, 30]} />
                    <Tooltip contentStyle={{ backgroundColor: "white", borderRadius: "8px", border: "1px solid #ddd", fontSize: "12px" }} cursor={{ fill: "rgba(0, 0, 0, 0.1)" }} />
                    <Legend verticalAlign="top" height={36} />
                    <Bar dataKey={`${category}_ok`} stackId="a" fill={colors[`${category}_ok`]} radius={[5, 5, 0, 0]} />
                    <Bar dataKey={`${category}_not_ok`} stackId="a" fill={colors[`${category}_not_ok`]} radius={[5, 5, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
        </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 g-gray-200gap-6" style={{ paddingTop: "2px", paddingLeft: "470px", height: "0px", width:"0px" }}>
            {["scale", "ups", "ind_backup", "sales"].map((category) => (
              <div key={category} className="w-full bg-white shadow-lg rounded-xl p-4" style={{ width: "430px", height: "auto" , overflow: "auto" }}>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">{category.replace(/_/g, " ").toUpperCase()}</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={filteredData} margin={{ top: -10, right: 10, left: -15, bottom: -5 }} barGap={6} barCategoryGap={10}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ddd" /> {/* Grid lines added */}
                    <XAxis dataKey="store" tick={{ fill: "#555", fontSize: 12, fontWeight: 600 }} tickLine={false} />
                    <YAxis tick={{ fill: "#555", fontSize: 12, fontWeight: 600 }} domain={['auto', 'auto']} ticks={[5, 10, 15, 20, 25, 30]} />
                    <Tooltip contentStyle={{ backgroundColor: "white", borderRadius: "8px", border: "1px solid #ddd", fontSize: "12px" }} cursor={{ fill: "rgba(0, 0, 0, 0.1)" }} />
                    <Legend verticalAlign="top" height={36} />
                    <Bar dataKey={`${category}_ok`} stackId="a" fill={colors[`${category}_ok`]} radius={[5, 5, 0, 0]} />
                    <Bar dataKey={`${category}_not_ok`} stackId="a" fill={colors[`${category}_not_ok`]} radius={[5, 5, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
          <div className="p-6 min-h-screen bg-gray-100" style={{ paddingLeft: "910px", height: "0px", width:"0px" }}>
            <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-6">
              {tables.map(({ title, color, keyPrefix }) => (
                <div key={keyPrefix} className="bg-white shadow-lg rounded-xl p-3" style={{ width: "365px", height: "auto" }}>
                  <h2 className={`text-base font-semibold mb-2 text-${color}-700`}>{title}</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-300 rounded-lg text-xs">
                      <thead>
                        <tr className={`bg-${color}-500 text-black text-xs`}>
                          <th className="px-2 py-1">Store</th>
                          <th className="px-2 py-1">Status</th>
                          <th className="px-2 py-1">Verified</th>
                          <th className="px-2 py-1">Total</th>
                          <th className="px-2 py-1">Verified</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTableData.length > 0 ? (
                          filteredTableData.map((store, index) => (
                            <tr key={index} className="text-center border-b bg-gray-50 hover:bg-gray-100 text-xs">
                              <td className="px-2 py-1 font-medium">{store.store}</td>
                              <td className="px-2 py-1">{store[`${keyPrefix}_status`]}</td>
                              <td className="px-2 py-1">{store[`${keyPrefix}_verified`]}</td>
                              <td className="px-2 py-1">{store[`${keyPrefix}_count`]}</td>
                              <td className="px-2 py-1">{store[`${keyPrefix}_verified_count`]}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} className="px-2 py-1 text-center">No Data Available</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="p-6 min-h-screen bg-gray-100" style={{ paddingLeft: "1285px", height: "0px", width:"0px" }}>
            <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-6">
              {tables1.map(({ title, color, keyPrefix }) => (
                <div key={keyPrefix} className="bg-white shadow-lg rounded-xl p-3" style={{ width: "365px", height: "auto" }}>
                  <h2 className={`text-base font-semibold mb-2 text-${color}-700`}>{title}</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-300 rounded-lg text-xs">
                      <thead>
                        <tr className={`bg-${color}-500 text-black text-xs`}>
                          <th className="px-2 py-1">Store</th>
                          <th className="px-2 py-1">Status</th>
                          <th className="px-2 py-1">Verified</th>
                          <th className="px-2 py-1">Total</th>
                          <th className="px-2 py-1">Verified</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTableData.length > 0 ? (
                          filteredTableData.map((store, index) => (
                            <tr key={index} className="text-center border-b bg-gray-50 hover:bg-gray-100 text-xs">
                              <td className="px-2 py-1 font-medium">{store.store}</td>
                              <td className="px-2 py-1">{store[`${keyPrefix}_status`]}</td>
                              <td className="px-2 py-1">{store[`${keyPrefix}_verified`]}</td>
                              <td className="px-2 py-1">{store[`${keyPrefix}_count`]}</td>
                              <td className="px-2 py-1">{store[`${keyPrefix}_verified_count`]}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} className="px-2 py-1 text-center">No Data Available</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
      </>
    )};
  if (userGroup === "Front_Desk_User") {
    return <></>; 
  }
};

export default Home;


