import React, { useState, useEffect } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
  TextField,
  Box,
  MenuItem,
  InputAdornment,
  Alert,
  Snackbar,
  CircularProgress,
  Grid,
  Typography,
  Chip,
  FormControl,
  InputLabel,
  Select,
  Autocomplete,
  LinearProgress,
  Tooltip,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { styled } from "@mui/material/styles";
import jsPDF from "jspdf";
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import PropTypes from 'prop-types';
import { templates } from './templates';

// Definindo interfaces para os tipos
interface FormData {
  [key: string]: any;
  name: string;
  email: string;
  phone: string;
  location: string;
  professionalObjective: string;
  experience: Array<{
    company?: string;
    position?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
  }>;
  education: any[];
  skills: string[];
  languages: any[];
  projects: any[];
  certifications: any[];
  interests: any[];
  hobbies: any[];
  professionalSummary?: string;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
}

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  onStepClick: (step: number) => void;
}

interface ErrorState {
  [key: string]: string;
}

// Componente de barra de progresso estilizado
const StyledProgressBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  '& .step': {
    width: 20,
    height: 20,
    borderRadius: '50%',
    margin: '0 8px',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    '&:hover': {
      transform: 'scale(1.1)',
    },
  },
}));

const ProgressBar = ({ currentStep, totalSteps, onStepClick }: ProgressBarProps) => {
  const steps: number[] = [];
  for (let i = 1; i <= totalSteps; i++) {
    steps.push(i);
  }
  return (
    <StyledProgressBar>
      {steps.map((step) => (
        <Box
          key={step}
          className="step"
          onClick={() => onStepClick(step)}
          sx={{
            backgroundColor: step <= currentStep ? 'primary.main' : 'grey.500',
          }}
          role="button"
          aria-label={`Ir para etapa ${step}`}
          tabIndex={0}
        />
      ))}
    </StyledProgressBar>
  );
};

ProgressBar.propTypes = {
  currentStep: PropTypes.number.isRequired,
  totalSteps: PropTypes.number.isRequired,
  onStepClick: PropTypes.func.isRequired,
};

const DrawerMenu = () => {
  const [open, setOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    location: '',
    professionalObjective: '',
    experience: [],
    education: [],
    skills: [],
    languages: [],
    projects: [],
    certifications: [],
    interests: [],
    hobbies: []
  });

  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, message: '', severity: 'success' });
  const [errors, setErrors] = useState<ErrorState>({});

  const skillOptions = [
    "JavaScript", "TypeScript", "React", "Node.js", "Python", "Java", "C++", "SQL",
    "Git", "Docker", "AWS", "Azure", "DevOps", "UI/UX", "Agile", "Scrum",
    "Communication", "Leadership", "Problem Solving", "Team Work", "Time Management"
  ];

  const languageLevels = ["Básico", "Intermediário", "Avançado", "Fluente", "Nativo"];

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return value;
  };

  const validateField = (name: string, value: string) => {
    switch (name) {
      case 'name':
        return !value ? 'Nome é obrigatório' : '';
      case 'email':
        return !value ? 'Email é obrigatório' : 
               !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Email inválido' : '';
      case 'phone':
        if (!value) return 'Telefone é obrigatório';
        const numbers = value.replace(/\D/g, '');
        if (numbers.length < 10 || numbers.length > 11) return 'Telefone inválido';
        return '';
      case 'professionalObjective':
        return !value ? 'Objetivo profissional é obrigatório' : '';
      case 'professionalSummary':
        return !value ? 'Resumo profissional é obrigatório' : '';
      default:
        return '';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const formattedValue = name === 'phone' ? formatPhoneNumber(value) : value;
    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
    const error = validateField(name, formattedValue);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleArrayChange = (field: string, index: number, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item: any, i: number) => 
        i === index ? { ...item, ...value } : item
      )
    }));
  };

  const addArrayItem = (field: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], {}]
    }));
  };

  const removeArrayItem = (field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i: number) => i !== index)
    }));
  };

  const handleTemplateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const template = templates.find(t => t.name === event.target.value);
    if (template) {
      setSelectedTemplate(template);
    }
  };

  const generateWordDocument = async () => {
    try {
      setLoading(true);
      const doc = selectedTemplate.generate(formData);
      const buffer = await Packer.toBlob(doc);
      saveAs(buffer, `${formData.name.toLowerCase().replace(/\s+/g, '-')}-resume.docx`);
      setSnackbar({
        open: true,
        message: 'Documento Word gerado com sucesso!',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Erro ao gerar documento Word',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    try {
      setLoading(true);
      const doc = new jsPDF();
      let y = 20;

      // Nome
      doc.setFontSize(24);
      doc.setTextColor(33, 33, 33);
      doc.text(formData.name, 20, y);
      y += 10;

      // Informações de contato
      doc.setFontSize(12);
      doc.setTextColor(117, 117, 117);
      doc.text(`${formData.email} | ${formData.phone} | ${formData.location}`, 20, y);
      y += 15;

      // Objetivo Profissional
      doc.setFontSize(16);
      doc.setTextColor(33, 33, 33);
      doc.text('Objetivo Profissional', 20, y);
      y += 10;
      doc.setFontSize(12);
      doc.setTextColor(66, 66, 66);
      doc.text(formData.professionalObjective, 20, y);
      y += 15;

      // Experiência
      doc.setFontSize(16);
      doc.setTextColor(33, 33, 33);
      doc.text('Experiência Profissional', 20, y);
      y += 10;

      formData.experience.forEach(exp => {
        doc.setFontSize(14);
        doc.setTextColor(33, 33, 33);
        doc.text(exp.position || '', 20, y);
        y += 7;
        doc.setFontSize(12);
        doc.setTextColor(117, 117, 117);
        doc.text(`${exp.company || ''} | ${exp.startDate || ''} - ${exp.endDate || ''}`, 20, y);
        y += 7;
        doc.setTextColor(66, 66, 66);
        doc.text(exp.description || '', 20, y);
        y += 15;
      });

      // Educação
      if (formData.education.length > 0) {
        doc.setFontSize(16);
        doc.setTextColor(33, 33, 33);
        doc.text('Educação', 20, y);
        y += 10;

        formData.education.forEach(edu => {
          doc.setFontSize(14);
          doc.setTextColor(33, 33, 33);
          doc.text(edu.course || '', 20, y);
          y += 7;
          doc.setFontSize(12);
          doc.setTextColor(117, 117, 117);
          doc.text(`${edu.institution || ''} | ${edu.startDate || ''} - ${edu.endDate || ''}`, 20, y);
          y += 15;
        });
      }

      // Idiomas
      if (formData.languages.length > 0) {
        doc.setFontSize(16);
        doc.setTextColor(33, 33, 33);
        doc.text('Idiomas', 20, y);
        y += 10;

        formData.languages.forEach(lang => {
          doc.setFontSize(12);
          doc.setTextColor(66, 66, 66);
          doc.text(`${lang.language || ''} - ${lang.level || ''}`, 20, y);
          y += 7;
        });
      }

      doc.save(`${formData.name.toLowerCase().replace(/\s+/g, '-')}-resume.pdf`);
      setSnackbar({
        open: true,
        message: 'PDF gerado com sucesso!',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Erro ao gerar PDF',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStepClick = (newStep: number) => {
    if (newStep < step) {
      setStep(newStep);
    } else if (newStep > step) {
      // Validar campos da etapa atual antes de avançar
      const currentStepFields = {
        2: ['name', 'email'],
        3: ['professionalObjective'],
      }[step] || [];

      const currentErrors = currentStepFields.reduce((acc, field) => {
        const error = validateField(field, formData[field]);
        return { ...acc, [field]: error };
      }, {});

      if (Object.values(currentErrors).some(error => error)) {
        setErrors(currentErrors);
        setSnackbar({
          open: true,
          message: 'Por favor, corrija os erros antes de avançar',
          severity: 'error'
        });
        return;
      }

      setStep(newStep);
    }
  };

  return (
    <>
      <IconButton
        edge="start"
        color="inherit"
        aria-label="menu"
        onClick={() => setOpen(true)}
      >
        <MenuIcon />
      </IconButton>

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: { width: '100%', maxWidth: 600 }
        }}
      >
        <Box sx={{ p: 3 }}>
          <ProgressBar
            currentStep={step}
            totalSteps={6}
            onStepClick={handleStepClick}
          />

          {step === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Informações Pessoais
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <TextField
                    fullWidth
                    label="Nome Completo"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    error={!!errors.name}
                    helperText={errors.name}
                  />
                </Box>
                <Box>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={!!errors.email}
                    helperText={errors.email}
                  />
                </Box>
                <Box>
                  <TextField
                    fullWidth
                    label="Telefone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    error={!!errors.phone}
                    helperText={errors.phone}
                    placeholder="(00) 00000-0000"
                  />
                </Box>
                <Box>
                  <TextField
                    fullWidth
                    label="Localização"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Cidade, Estado"
                  />
                </Box>
              </Box>
            </Box>
          )}

          {step === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Experiência Profissional
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {formData.experience.map((exp, index) => (
                  <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <TextField
                        fullWidth
                        label="Empresa"
                        value={exp.company || ''}
                        onChange={(e) => handleArrayChange('experience', index, { company: e.target.value })}
                      />
                      <TextField
                        fullWidth
                        label="Cargo"
                        value={exp.position || ''}
                        onChange={(e) => handleArrayChange('experience', index, { position: e.target.value })}
                      />
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                          fullWidth
                          label="Data de Início"
                          type="date"
                          value={exp.startDate || ''}
                          onChange={(e) => handleArrayChange('experience', index, { startDate: e.target.value })}
                          InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                          fullWidth
                          label="Data de Término"
                          type="date"
                          value={exp.endDate || ''}
                          onChange={(e) => handleArrayChange('experience', index, { endDate: e.target.value })}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Box>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Descrição das Atividades"
                        value={exp.description || ''}
                        onChange={(e) => handleArrayChange('experience', index, { description: e.target.value })}
                      />
                    </Box>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => removeArrayItem('experience', index)}
                      sx={{ mt: 1 }}
                    >
                      Remover Experiência
                    </Button>
                  </Box>
                ))}
                <Button
                  variant="contained"
                  onClick={() => addArrayItem('experience')}
                  sx={{ mt: 2 }}
                >
                  Adicionar Experiência
                </Button>
              </Box>
            </Box>
          )}

          {step === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Habilidades e Competências
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Autocomplete
                  multiple
                  options={skillOptions}
                  value={formData.skills}
                  onChange={(_, newValue) => {
                    setFormData(prev => ({
                      ...prev,
                      skills: newValue
                    }));
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Habilidades Técnicas"
                      placeholder="Adicione suas habilidades"
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        label={option}
                        {...getTagProps({ index })}
                        key={option}
                      />
                    ))
                  }
                />
              </Box>
            </Box>
          )}

          {step === 4 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Resumo e Objetivos
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Resumo Profissional"
                  name="professionalSummary"
                  value={formData.professionalSummary}
                  onChange={handleChange}
                  error={!!errors.professionalSummary}
                  helperText={errors.professionalSummary}
                />
              </Box>
            </Box>
          )}

          {step === 5 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Educação
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {formData.education.map((edu, index) => (
                  <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <TextField
                        fullWidth
                        label="Instituição"
                        value={edu.institution || ''}
                        onChange={(e) => handleArrayChange('education', index, { institution: e.target.value })}
                      />
                      <TextField
                        fullWidth
                        label="Curso"
                        value={edu.course || ''}
                        onChange={(e) => handleArrayChange('education', index, { course: e.target.value })}
                      />
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                          fullWidth
                          label="Data de Início"
                          type="date"
                          value={edu.startDate || ''}
                          onChange={(e) => handleArrayChange('education', index, { startDate: e.target.value })}
                          InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                          fullWidth
                          label="Data de Término"
                          type="date"
                          value={edu.endDate || ''}
                          onChange={(e) => handleArrayChange('education', index, { endDate: e.target.value })}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Box>
                    </Box>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => removeArrayItem('education', index)}
                      sx={{ mt: 1 }}
                    >
                      Remover Educação
                    </Button>
                  </Box>
                ))}
                <Button
                  variant="contained"
                  onClick={() => addArrayItem('education')}
                  sx={{ mt: 2 }}
                >
                  Adicionar Educação
                </Button>
              </Box>
            </Box>
          )}

          {step === 6 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Idiomas
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {formData.languages.map((lang, index) => (
                  <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <TextField
                        fullWidth
                        label="Idioma"
                        value={lang.language || ''}
                        onChange={(e) => handleArrayChange('languages', index, { language: e.target.value })}
                      />
                      <FormControl fullWidth>
                        <InputLabel>Nível</InputLabel>
                        <Select
                          value={lang.level || ''}
                          label="Nível"
                          onChange={(e) => handleArrayChange('languages', index, { level: e.target.value })}
                        >
                          {languageLevels.map((level) => (
                            <MenuItem key={level} value={level}>
                              {level}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => removeArrayItem('languages', index)}
                      sx={{ mt: 1 }}
                    >
                      Remover Idioma
                    </Button>
                  </Box>
                ))}
                <Button
                  variant="contained"
                  onClick={() => addArrayItem('languages')}
                  sx={{ mt: 2 }}
                >
                  Adicionar Idioma
                </Button>
              </Box>
            </Box>
          )}

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="contained"
              onClick={() => setStep(prev => Math.max(1, prev - 1))}
              disabled={step === 1}
            >
              Anterior
            </Button>
            <Box>
              <Button
                variant="contained"
                onClick={generatePDF}
                sx={{ mr: 1 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Baixar PDF'}
              </Button>
              <Button
                variant="contained"
                onClick={generateWordDocument}
                sx={{ mr: 1 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Baixar Word'}
              </Button>
              <Button
                variant="contained"
                onClick={() => setStep(prev => Math.min(6, prev + 1))}
                disabled={step === 6}
              >
                Próximo
              </Button>
            </Box>
          </Box>
        </Box>
      </Drawer>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default DrawerMenu;