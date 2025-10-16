import React, { useEffect, useState } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, ReferenceDot, Label  } from "recharts";
import { PieChart, Pie, Cell} from "recharts";
import { API_BASE_URL } from '../config';

const Home = () => {
  const [data, setData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [selectedStore, setSelectedStore] = useState("All"); 

  useEffect(() => {
    fetch(`${API_BASE_URL}/?format=json`)
      .then((response) => response.json())
      .then((data) => {
        setData(data.data || []);
        transformChartData(data.data || []);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

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
    pos_ok: "#FFC107",
    pos_not_ok: "#D32F2F",
    pdt_ok: "#FFC107",
    pdt_not_ok: "#D32F2F",
    scale_ok: "#FFC107",
    scale_not_ok: "#D32F2F",
    ups_ok: "#FFC107",
    ups_not_ok: "#D32F2F",
    server_ok: "#FFC107",
    server_not_ok: "#D32F2F",
    ind_backup_ok: "#FFC107",
    ind_backup_not_ok: "#D32F2F",
    acronics_ok: "#FFC107",
    acronics_not_ok: "#D32F2F",
    sales_ok:  "#FFC107",
    sales_not_ok:"#D32F2F",
    pos_backup_ok: "#FFC107",
    pos_backup_not_ok: "#D32F2F",
  };

// Summary Data: Summarized for "All" selection
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


// Chart Data: Store-wise (no summation)
const filteredData = selectedStore === "All"
  ? chartData
  : chartData.filter((item) => item.store === selectedStore);



  // Filter the raw data for the table as well
  const filteredTableData = selectedStore === "All" 
    ? data 
    : data.filter((item) => item.store === selectedStore);

  const storeNames = ["All", ...new Set(data.map((item) => item.store))];

  const tables = [
    { title: "🛒 PLU2 Status", color: "blue", keyPrefix: "plu2" },
    { title: "🖥️ POS Status", color: "red", keyPrefix: "pos" },
    { title: "⚖️ Scale Status", color: "yellow", keyPrefix: "scale" },
    { title: "🖥️ Server Status", color: "gray", keyPrefix: "server" },
    { title: "📂 POS Backup", color: "teal", keyPrefix: "pos_backup" },
    { title: "🛍️ Sale Status", color: "indigo", keyPrefix: "sale_status" },
    { title: "🗂️ Ind Store Backup", color: "amber", keyPrefix: "ind_store_backup" },
  ];

  const tables1 = [
    { title: "💰 Sale Status", color: "green", keyPrefix: "sale" },
    { title: "📱 PDT Status", color: "purple", keyPrefix: "pdt" },
    { title: "⚡ UPS Status", color: "orange", keyPrefix: "ups" },
    { title: "🖥️ Server Storage", color: "gray", keyPrefix: "server_storage" },
    { title: "🖥️ POS Performance", color: "cyan", keyPrefix: "pos_performance" },
    { title: "📄 Zvchr Status", color: "pink", keyPrefix: "zvchr" },
    { title: "💾 Acronics Backup", color: "lime", keyPrefix: "acronics_backup" },
  ];

  const getColor = (status, type) => {
    if (type === "plu2Status") {
      return status === "Manually Generated" ? "#ffd957" : status === "Generated" ? "#358639" : status === "Not Generated" ? "#e15759": "#4e79a7";
    }
    if (type === "folderStatus") {
      return status === "F:\\TPDotnet\\Server\\HostData\\Upload\\Processed" ? "#358639" : 
             status === "F:\\TPDotnet\\Server\\HostData\\Upload\\Data" ? "#ffd957" :
             status === ":\\TPDotnet\\Server\\HostData\\Upload\\Invalid" ? "#e15759" 
             : "#4e79a7";
    }
    if (type === "eodStatus" || type === "idocFileStatus") {
      return status === "Success" ? "#358639" : status === "Failure" ? "#e15759" : "#4e79a7";
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
        color: getColor(status, statusType),
      };
    });
  };

  const [username, setUsername] = useState('');
  const [userGroup, setUserGroup] = useState('');
  
  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    const storedUserGroup = localStorage.getItem('userGroup');
    setUsername(storedUsername || ''); 
    setUserGroup(storedUserGroup || ''); 
  }, []);

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
            {["pos", "pdt", "server", "acronics", "pos_backup"].map((category) => (
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
          <div className="grid grid-cols-1 lg:grid-cols-2 g-gray-200gap-6" style={{ paddingLeft: "1800px", height: "0px", width:"0px" }}>
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white shadow-lg rounded-xl p-6">
                {["plu2Status", "eodStatus", "idocFileStatus", "folderStatus"].map((statusType) => (
                  <div key={statusType} className="flex flex-col items-center">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                      {statusType.replace(/([A-Z])/g, " $1").trim()}
                    </h3>
                    <ResponsiveContainer width={250} height={250}>
                      <PieChart>
                        <Pie
                          data={processData(data, statusType)}
                          cx="50%"
                          cy="50%"
                          innerRadius={50} // Donut style
                          outerRadius={80}
                          dataKey="value"
                        >
                          {processData(data, statusType).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ))}
              </div>
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
            {["pos", "pdt", "server", "acronics", "pos_backup"].map((category) => (
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
          <div className="grid grid-cols-1 lg:grid-cols-2 g-gray-200gap-6" style={{ paddingLeft: "1800px", height: "0px", width:"0px" }}>
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white shadow-lg rounded-xl p-6">
                {["plu2Status", "eodStatus", "idocFileStatus", "folderStatus"].map((statusType) => (
                  <div key={statusType} className="flex flex-col items-center">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                      {statusType.replace(/([A-Z])/g, " $1").trim()}
                    </h3>
                    <ResponsiveContainer width={250} height={250}>
                      <PieChart>
                        <Pie
                          data={processData(data, statusType)}
                          cx="50%"
                          cy="50%"
                          innerRadius={50} // Donut style
                          outerRadius={80}
                          dataKey="value"
                        >
                          {processData(data, statusType).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ))}
              </div>
            </div>
          </div>
      </>
    )};
  
  if (userGroup === "End_User") {
    return <></>; // Blank page for End_User
  }


  return (
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
          {["pos", "pdt", "server", "acronics", "pos_backup"].map((category) => (
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
        <div className="grid grid-cols-1 lg:grid-cols-2 g-gray-200gap-6" style={{ paddingLeft: "1800px", height: "0px", width:"0px" }}>
          <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white shadow-lg rounded-xl p-6">
              {["plu2Status", "eodStatus", "idocFileStatus", "folderStatus"].map((statusType) => (
                <div key={statusType} className="flex flex-col items-center">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    {statusType.replace(/([A-Z])/g, " $1").trim()}
                  </h3>
                  <ResponsiveContainer width={250} height={250}>
                    <PieChart>
                      <Pie
                        data={processData(data, statusType)}
                        cx="50%"
                        cy="50%"
                        innerRadius={50} // Donut style
                        outerRadius={80}
                        dataKey="value"
                      >
                        {processData(data, statusType).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ))}
            </div>
          </div>
        </div>
    </>
  );
};

export default Home;


