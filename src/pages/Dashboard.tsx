import './Dashboard.css'
import '../components/common/Section.css'
import '../components/common/Table.css'

const Dashboard = () => {
  return (
    <div className="dashboard">
      <h1 className="page-title">Dashboard</h1>
      
      <div className="kpi-cards">
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-icon">🛒</span>
            <h2>매입(萬)</h2>
          </div>
          <div className="kpi-value">25,917</div>
          <div className="kpi-details">
            <div className="kpi-month">
              <span>03월</span>
              <span>58,846</span>
            </div>
            <div className="kpi-month">
              <span>02월</span>
              <span>152,117</span>
            </div>
            <div className="kpi-month">
              <span>01월</span>
              <span>146,235</span>
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-icon">🚚</span>
            <h2>매출(萬)</h2>
          </div>
          <div className="kpi-value">18,234</div>
          <div className="kpi-details">
            <div className="kpi-month">
              <span>03월</span>
              <span>45,632</span>
            </div>
            <div className="kpi-month">
              <span>02월</span>
              <span>38,921</span>
            </div>
            <div className="kpi-month">
              <span>01월</span>
              <span>42,156</span>
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">▲오늘입고</h2>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>업체명</th>
                <th>소재명</th>
                <th>자사품명</th>
                <th>수량</th>
                <th>rolls</th>
                <th>금액</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={6} className="empty-row">데이터가 없습니다.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">▲생산현황 2023-04-19</h2>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>No</th>
                <th>생산일</th>
                <th>업체명</th>
                <th>자사품명</th>
                <th>출고품명</th>
                <th>LOT</th>
                <th>길이</th>
                <th>중량</th>
                <th>LOSS율</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>2023-04-19</td>
                <td>CELL BIO VINA</td>
                <td>PT Cell 70</td>
                <td>PT Cell 70</td>
                <td>230119-203</td>
                <td>1,051</td>
                <td>139.55</td>
                <td>6.90%</td>
              </tr>
              <tr>
                <td>2</td>
                <td>2023-04-19</td>
                <td>CELL BIO VINA</td>
                <td>PT Cell 70</td>
                <td>PT Cell 70</td>
                <td>230119-204</td>
                <td>1,045</td>
                <td>139.30</td>
                <td>5.94%</td>
              </tr>
              <tr>
                <td>3</td>
                <td>2023-04-19</td>
                <td>CELL BIO VINA</td>
                <td>PT Cell 70</td>
                <td>PT Cell 70</td>
                <td>230119-206</td>
                <td>1,000</td>
                <td>133.30</td>
                <td>12.13%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
