import { useState } from "react";
import {
  Container,
  HeaderPlagio,
  UploadSection,
  DropZone,
  FileInfo,
  FileName,
  FileSize,
  AnalyzeButton,
  ResultsSection,
  OverviewCards,
  MetricCard,
  MetricIcon,
  MetricValue,
  MetricLabel,
  DetailedReport,
  ReportSection,
  SectionHeader,
  SourcesList,
  SourceCard,
  SourceType,
  SourceInfo,
  SourceTitle,
  SourceMatch,
  SourceLink,
  ChartContainer,
  ProgressRing,
  ProgressText,
  AlertSection,
  AlertCard,
  ComparisonText,
  CopiedText,
  AnalyzingOverlay,
  AnalyzingContent,
  AnalyzingStep,
  StepIcon,
  StepText,
  LoadingBar,
  RemoveFileButton,
} from "../../../style/docente/iaPlagioDStyled";
import {
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle,
  Globe,
  Book,
  Users,
  Bot,
  ExternalLink,
  TrendingUp,
  Shield,
  Search,
  Download,
  X,
  Database,
  Cpu,
  FileSearch,
  BarChart3,
} from "lucide-react";
import { useColors } from "../../../style/colors";
import { authFetch } from "../../../services/api";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";
const IAPlagioDi = () => {
  const ColorsDoc = useColors();
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const analysisSteps = [
    { icon: Upload, text: "Cargando documento...", duration: 1000 },
    {
      icon: FileSearch,
      text: "Extrayendo texto y analizando estructura...",
      duration: 1500,
    },
    {
      icon: Database,
      text: "Comparando con base de datos universitaria...",
      duration: 2000,
    },
    {
      icon: Globe,
      text: "Buscando coincidencias en internet...",
      duration: 2000,
    },
    { icon: Cpu, text: "Detectando patrones de IA...", duration: 1500 },
    {
      icon: BarChart3,
      text: "Generando reporte de análisis...",
      duration: 1000,
    },
  ];

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      simulateFileUpload(uploadedFile);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      simulateFileUpload(droppedFile);
    }
  };

  const simulateFileUpload = (uploadedFile) => {
    setFile(uploadedFile);
    setResults(null);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  const analyzeDocument = async () => {
    if (!file) {
      toast.warning("Primero selecciona un archivo para analizar.");
      return;
    }
    if (uploadProgress < 100) {
      toast.info("Espera a que el archivo termine de cargarse.");
      return;
    }

    setAnalyzing(true);
    setCurrentStep(0);
    setResults(null);

    const pasos = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % analysisSteps.length);
    }, 1500);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await authFetch(`${API_BASE}/api/plagio/upload`, {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error("Error subiendo el archivo para análisis.");
      }

      const uploadData = await uploadRes.json();
      const documentoId = uploadData.documentoId;

      if (!documentoId) {
        throw new Error("El backend no devolvió un documentoId.");
      }

      const res = await authFetch(`${API_BASE}/api/plagio/analizar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentoId }),
      });

      if (!res.ok) {
        throw new Error("Error al analizar el documento.");
      }

      const data = await res.json();
      clearInterval(pasos);
      setResults(data);
      toast.success("Análisis completado correctamente.");
    } catch (err) {
      console.error(err);
      clearInterval(pasos);
      toast.error(err.message || "Ocurrió un error al analizar el documento.");
    } finally {
      clearInterval(pasos);
      setAnalyzing(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setResults(null);
    setUploadProgress(0);
  };

  const getColorByPercentage = (value) => {
    if (value >= 80) return "#4ECDC4";
    if (value >= 60) return "#52C41A";
    if (value >= 40) return "#FFA500";
    return "#FF6B6B";
  };

  const getSourceIcon = (tipo) => {
    switch (tipo) {
      case "web":
        return Globe;
      case "universidad":
        return Users;
      case "libro":
        return Book;
      case "ia":
        return Bot;
      default:
        return FileText;
    }
  };

  return (
    <Container>
      <HeaderPlagio
        style={{
          background: `linear-gradient(135deg, ${ColorsDoc.primary} 0%, ${ColorsDoc.primary100} 100%)`,
        }}
      >
        <div>
          <h1>
            <Shield size={32} />
            Detector de Plagio Avanzado
          </h1>
          <p>
            Análisis completo con IA para detectar plagio académico y contenido
            generado
          </p>
        </div>

        <div style={{ color: "white", textAlign: "right" }}>
          <small>Versión 2.1 • Base de datos actualizada</small>
          <br />
          <small>+5,000 proyectos universitarios indexados</small>
        </div>
      </HeaderPlagio>

      <UploadSection>
        <DropZone
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          hasFile={!!file}
          isDragging={isDragging}
        >
          {!file ? (
            <>
              <Upload
                size={48}
                color={isDragging ? ColorsDoc.primary : "#9ca3af"}
              />
              <h3>Arrastra el documento aquí</h3>
              <p>o haz clic para seleccionar</p>
              <input
                type="file"
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.txt"
                style={{ display: "none" }}
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <button style={{ background: ColorsDoc.primary }}>
                  Seleccionar Archivo
                </button>
              </label>
              <span>Formatos soportados: PDF, DOC, DOCX, TXT • Máx 10MB</span>
            </>
          ) : (
            <FileInfo>
              <FileText size={48} color={ColorsDoc.primary} />
              <FileName>{file.name}</FileName>
              <FileSize>{(file.size / 1024 / 1024).toFixed(2)} MB</FileSize>

              {uploadProgress < 100 ? (
                <LoadingBar>
                  <div style={{ width: `${uploadProgress}%` }} />
                  <span>Cargando... {uploadProgress}%</span>
                </LoadingBar>
              ) : (
                <>
                  <AnalyzeButton
                    onClick={analyzeDocument}
                    disabled={analyzing}
                    style={{ background: ColorsDoc.primary }}
                  >
                    {analyzing ? (
                      <>
                        <Search size={20} className="spinning" />
                        Analizando...
                      </>
                    ) : (
                      <>
                        <Search size={20} />
                        Iniciar Análisis Completo
                      </>
                    )}
                  </AnalyzeButton>
                  <RemoveFileButton onClick={removeFile}>
                    <X size={18} />
                    Remover archivo
                  </RemoveFileButton>
                </>
              )}
            </FileInfo>
          )}
        </DropZone>
      </UploadSection>

      {analyzing && (
        <AnalyzingOverlay>
          <AnalyzingContent>
            <Shield
              size={64}
              color={ColorsDoc.primary}
              className="shield-pulse"
            />
            <h2>Analizando Documento</h2>
            <p>Por favor espera mientras procesamos tu archivo...</p>

            <div style={{ width: "100%", marginTop: "2rem" }}>
              {analysisSteps.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === index;
                const isCompleted = currentStep > index;

                return (
                  <AnalyzingStep
                    key={index}
                    active={isActive}
                    completed={isCompleted}
                  >
                    <StepIcon active={isActive} completed={isCompleted}>
                      <Icon size={20} />
                    </StepIcon>
                    <StepText active={isActive} completed={isCompleted}>
                      {step.text}
                    </StepText>
                  </AnalyzingStep>
                );
              })}
            </div>
          </AnalyzingContent>
        </AnalyzingOverlay>
      )}

      {results && (
        <ResultsSection>
          <div
            style={{
              background: "white",
              padding: "1rem",
              borderRadius: "12px",
              marginBottom: "1rem",
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.08)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                color: "#6b7280",
                fontSize: "0.9rem",
              }}
            >
              <span>📅 Análisis completado: {results.fechaAnalisis}</span>
              <span>⏱️ Tiempo: {results.tiempoAnalisis}</span>
              <span>📝 {results.palabrasAnalizadas} palabras analizadas</span>
              <span>📊 {results.frasesAnalizadas} frases procesadas</span>
            </div>
          </div>

          <OverviewCards>
            <MetricCard>
              <MetricIcon
                style={{
                  background: `${getColorByPercentage(results.originalidad)}15`,
                }}
              >
                <CheckCircle
                  size={32}
                  color={getColorByPercentage(results.originalidad)}
                />
              </MetricIcon>
              <MetricValue
                style={{ color: getColorByPercentage(results.originalidad) }}
              >
                {results.originalidad}%
              </MetricValue>
              <MetricLabel>Contenido Original</MetricLabel>
              <small style={{ color: "#9ca3af", marginTop: "0.5rem" }}>
                {results.originalidad >= 60
                  ? "✅ Aceptable"
                  : "⚠️ Bajo el mínimo"}
              </small>
            </MetricCard>

            <MetricCard>
              <MetricIcon style={{ background: "#FF6B6B15" }}>
                <Globe size={32} color="#FF6B6B" />
              </MetricIcon>
              <MetricValue style={{ color: "#FF6B6B" }}>
                {results.plagioWeb}%
              </MetricValue>
              <MetricLabel>Plagio Web</MetricLabel>
              <small style={{ color: "#9ca3af", marginTop: "0.5rem" }}>
                {results.fuentes.filter((f) => f.tipo === "web").length} fuentes
              </small>
            </MetricCard>

            <MetricCard>
              <MetricIcon style={{ background: "#FFA50015" }}>
                <Users size={32} color="#FFA500" />
              </MetricIcon>
              <MetricValue style={{ color: "#FFA500" }}>
                {results.plagioUniversidad}%
              </MetricValue>
              <MetricLabel>Proyectos UNIFRANZ</MetricLabel>
              <small style={{ color: "#9ca3af", marginTop: "0.5rem" }}>
                {results.fuentes.filter((f) => f.tipo === "universidad").length}{" "}
                coincidencias
              </small>
            </MetricCard>

            <MetricCard>
              <MetricIcon style={{ background: "#9B59B615" }}>
                <Bot size={32} color="#9B59B6" />
              </MetricIcon>
              <MetricValue style={{ color: "#9B59B6" }}>
                {results.contenidoIA}%
              </MetricValue>
              <MetricLabel>Generado por IA</MetricLabel>
              <small style={{ color: "#9ca3af", marginTop: "0.5rem" }}>
                {results.contenidoIA > 10 ? "⚠️ Detectado" : "✅ No detectado"}
              </small>
            </MetricCard>
          </OverviewCards>

          <ChartContainer>
            <ProgressRing>
              <svg width="200" height="200">
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#e9ecef"
                  strokeWidth="20"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke={getColorByPercentage(results.originalidad)}
                  strokeWidth="20"
                  strokeDasharray={`${results.originalidad * 5.02} 502`}
                  strokeDashoffset="125"
                  strokeLinecap="round"
                  style={{ transition: "all 1s ease" }}
                />
              </svg>
              <ProgressText>
                <span>{results.originalidad}%</span>
                <label>Original</label>
              </ProgressText>
            </ProgressRing>

            <div style={{ flex: 1, padding: "0 2rem" }}>
              <h3 style={{ marginBottom: "1rem", color: "#2c3e50" }}>
                Distribución del Contenido
              </h3>
              {[
                {
                  label: "Original",
                  value: results.originalidad,
                  color: getColorByPercentage(results.originalidad),
                },
                { label: "Web", value: results.plagioWeb, color: "#FF6B6B" },
                {
                  label: "Universidad",
                  value: results.plagioUniversidad,
                  color: "#FFA500",
                },
                { label: "IA", value: results.contenidoIA, color: "#9B59B6" },
              ].map((item) => (
                <div key={item.label} style={{ marginBottom: "1rem" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "0.25rem",
                    }}
                  >
                    <span style={{ color: "#6b7280", fontSize: "0.9rem" }}>
                      {item.label}
                    </span>
                    <span style={{ color: item.color, fontWeight: "600" }}>
                      {item.value}%
                    </span>
                  </div>
                  <div
                    style={{
                      height: "8px",
                      background: "#e9ecef",
                      borderRadius: "4px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${item.value}%`,
                        height: "100%",
                        background: item.color,
                        transition: "width 1s ease",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </ChartContainer>

          {results.alertas.length > 0 && (
            <AlertSection>
              <SectionHeader>
                <AlertTriangle size={24} color="#FF6B6B" />
                Alertas Detectadas
              </SectionHeader>
              {results.alertas.map((alerta, index) => (
                <AlertCard key={index} nivel={alerta.nivel}>
                  <AlertTriangle size={20} />
                  {alerta.mensaje}
                </AlertCard>
              ))}
            </AlertSection>
          )}

          <DetailedReport>
            <ReportSection>
              <SectionHeader>
                <FileText size={24} />
                Fuentes Detectadas ({results.fuentes.length})
              </SectionHeader>

              <SourcesList>
                {results.fuentes.map((fuente, index) => {
                  const Icon = getSourceIcon(fuente.tipo);
                  return (
                    <SourceCard key={index}>
                      <SourceType tipo={fuente.tipo}>
                        <Icon size={20} />
                        {fuente.tipo.toUpperCase()}
                      </SourceType>

                      <SourceInfo>
                        <SourceTitle>{fuente.titulo}</SourceTitle>
                        <p>Autor/Fuente: {fuente.autor}</p>
                        {fuente.metodo && (
                          <p
                            style={{
                              fontSize: "0.75rem",
                              color: "#6b7280",
                              marginTop: "0.25rem",
                            }}
                          >
                            Método: {fuente.metodo}
                          </p>
                        )}
                        <SourceMatch>
                          <TrendingUp size={16} />
                          Coincidencia: {fuente.coincidencia}%
                        </SourceMatch>
                      </SourceInfo>

                      {fuente.url && (
                        <SourceLink href={fuente.url} target="_blank">
                          <ExternalLink size={18} />
                          Ver fuente
                        </SourceLink>
                      )}
                    </SourceCard>
                  );
                })}
              </SourcesList>
            </ReportSection>

            <ReportSection>
              <SectionHeader>Fragmentos Detectados</SectionHeader>

              <ComparisonText>
                {results.fragmentos?.filter(Boolean).map((fragmento, index) => {
                  const tipo = fragmento.tipo || "original";
                  const Icon = getSourceIcon(tipo);
                  return (
                    <div key={index} style={{ marginBottom: "1.5rem" }}>
                      <CopiedText tipo={tipo}>
                        <q>{fragmento.original || ""}</q>
                      </CopiedText>
                      <p
                        style={{
                          color: "#6b7280",
                          fontSize: "0.9rem",
                          marginTop: "0.5rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <Icon size={16} />
                        Fuente: {fragmento.fuente || "Desconocida"} ({tipo})
                      </p>
                    </div>
                  );
                })}
              </ComparisonText>
            </ReportSection>
          </DetailedReport>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "1rem",
              marginTop: "2rem",
            }}
          >
            <button
              style={{
                background: ColorsDoc.primary,
                color: "white",
                padding: "0.75rem 2rem",
                borderRadius: "10px",
                border: "none",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              <Download size={20} />
              Descargar Reporte PDF
            </button>
            <button
              style={{
                background: "white",
                color: ColorsDoc.primary,
                padding: "0.75rem 2rem",
                borderRadius: "10px",
                border: `2px solid ${ColorsDoc.primary}`,
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                cursor: "pointer",
                fontWeight: "600",
              }}
              onClick={removeFile}
            >
              <FileText size={20} />
              Analizar Otro Documento
            </button>
          </div>
        </ResultsSection>
      )}
    </Container>
  );
};

export default IAPlagioDi;
