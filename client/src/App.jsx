import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import HomePage from "./pages/HomePage.jsx";
import SummaryQuizPage from "./pages/SummaryQuizPage.jsx";
import ExamsPage from "./pages/ExamsPage.jsx";
import ExamRunnerPage from "./pages/ExamRunnerPage.jsx";
import LabsPage from "./pages/LabsPage.jsx";
import WebVmPage from "./pages/WebVmPage.jsx";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/summary-quiz" element={<SummaryQuizPage />} />
        <Route path="/exams" element={<ExamsPage />} />
        <Route path="/exams/:examId" element={<ExamRunnerPage />} />
        <Route path="/labs" element={<LabsPage />} />
        <Route path="/labs/webvm" element={<WebVmPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
