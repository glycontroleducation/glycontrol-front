import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Home, Activity, Utensils, Droplet, BarChart2, MessageCircle, Users, User,
  Calendar, HelpCircle, ChevronLeft, ChevronRight, Plus, Minus, Search,
  Eye, EyeOff, Check, X, Send, Mic, Camera, Heart, ArrowRight, Sparkles,
  Salad, ShieldCheck, FileText, Accessibility, Trash2, LogOut, Edit2,
  ChevronDown, ChevronUp, AlertTriangle, CheckCircle2, Info
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend
} from "recharts";

/* ============================================================
   GlyControl — Sistema completo (protótipo funcional)
   Arquitetura pensada para futura migração:
   - "storage.js" (aqui simulado via window.storage) -> substituir por API REST/DB real
   - "FOOD_DB" -> substituir por tabela `alimentos` em banco real (fonte TACO/TBCA)
   - Autenticação local -> substituir por auth real (JWT/sessão + hash de senha)
   - Cada seção comentada indica onde plugar IA real (ver ChatScreen)
   ============================================================ */

/* ---------------------- BANCO DE ALIMENTOS ---------------------- */
/* Fonte: TACO 4a ed. (NEPA/UNICAMP) e TBCA (USP/FoRC), conforme
   Banco_de_Dados_GlyControl_Calorias_TBCA_TACO. Valores por 100g. */
const FOOD_DB = [{"id": "TACO_0001", "nome": "Arroz integral cozido", "categoria": "Cereais", "medida": "4 colheres de sopa", "porcaoG": 100, "kcal": 123.53, "carb": 25.81, "prot": 2.59, "gord": 1.0, "fibra": 2.75, "sodio": 1.24, "apto": true, "fonte": "TACO", "tags": ["whole_grain"]}, {"id": "TACO_0002", "nome": "Arroz integral cru", "categoria": "Cereais", "medida": "4 colheres de sopa", "porcaoG": 100, "kcal": 359.68, "carb": 77.45, "prot": 7.32, "gord": 1.86, "fibra": 4.82, "sodio": 1.65, "apto": true, "fonte": "TACO", "tags": ["whole_grain"]}, {"id": "TACO_0003", "nome": "Arroz tipo 1 cozido", "categoria": "Cereais", "medida": "4 colheres de sopa", "porcaoG": 100, "kcal": 128.26, "carb": 28.06, "prot": 2.52, "gord": 0.23, "fibra": 1.56, "sodio": 1.2, "apto": true, "fonte": "TACO", "tags": ["refined_grain"]}, {"id": "TACO_0004", "nome": "Arroz tipo 1 cru", "categoria": "Cereais", "medida": "4 colheres de sopa", "porcaoG": 100, "kcal": 357.79, "carb": 78.76, "prot": 7.16, "gord": 0.34, "fibra": 1.64, "sodio": 1.02, "apto": true, "fonte": "TACO", "tags": ["refined_grain"]}, {"id": "TACO_0005", "nome": "Arroz tipo 2 cozido", "categoria": "Cereais", "medida": "4 colheres de sopa", "porcaoG": 100, "kcal": 130.12, "carb": 28.19, "prot": 2.57, "gord": 0.36, "fibra": 1.07, "sodio": 1.96, "apto": true, "fonte": "TACO", "tags": ["refined_grain"]}, {"id": "TACO_0006", "nome": "Arroz tipo 2 cru", "categoria": "Cereais", "medida": "4 colheres de sopa", "porcaoG": 100, "kcal": 358.12, "carb": 78.88, "prot": 7.24, "gord": 0.28, "fibra": 1.72, "sodio": 0.57, "apto": true, "fonte": "TACO", "tags": ["refined_grain"]}, {"id": "TACO_0007", "nome": "Aveia flocos crua", "categoria": "Cereais", "medida": "4 colheres de sopa", "porcaoG": 100, "kcal": 393.82, "carb": 66.64, "prot": 13.92, "gord": 8.5, "fibra": 9.13, "sodio": 4.63, "apto": true, "fonte": "TACO", "tags": ["whole_grain"]}, {"id": "TACO_0008", "nome": "Biscoito doce maisena", "categoria": "Doces e sobremesas", "medida": "1 porção", "porcaoG": 100, "kcal": 442.82, "carb": 75.23, "prot": 8.07, "gord": 11.97, "fibra": 2.1, "sodio": 352.03, "apto": true, "fonte": "TACO", "tags": ["sweet"]}, {"id": "TACO_0009", "nome": "Biscoito doce recheado com chocolate", "categoria": "Doces e sobremesas", "medida": "1 porção", "porcaoG": 100, "kcal": 471.82, "carb": 70.55, "prot": 6.4, "gord": 19.58, "fibra": 2.96, "sodio": 239.2, "apto": true, "fonte": "TACO", "tags": ["sweet"]}, {"id": "TACO_0010", "nome": "Biscoito doce recheado com morango", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 471.17, "carb": 71.01, "prot": 5.72, "gord": 19.57, "fibra": 1.53, "sodio": 229.82, "apto": true, "fonte": "TACO", "tags": ["sweet", "fruit"]}, {"id": "TACO_0011", "nome": "Biscoito doce wafer recheado de chocolate", "categoria": "Doces e sobremesas", "medida": "1 porção", "porcaoG": 100, "kcal": 502.46, "carb": 67.54, "prot": 5.56, "gord": 24.67, "fibra": 1.8, "sodio": 137.24, "apto": true, "fonte": "TACO", "tags": ["sweet"]}, {"id": "TACO_0012", "nome": "Biscoito doce wafer recheado de morango", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 513.45, "carb": 67.35, "prot": 4.52, "gord": 26.4, "fibra": 0.82, "sodio": 119.9, "apto": true, "fonte": "TACO", "tags": ["sweet", "fruit"]}, {"id": "TACO_0013", "nome": "Biscoito salgado cream cracker", "categoria": "Industrializados", "medida": "1 porção", "porcaoG": 100, "kcal": 431.73, "carb": 68.73, "prot": 10.06, "gord": 14.44, "fibra": 2.51, "sodio": 854.36, "apto": true, "fonte": "TACO", "tags": ["ultraprocessed"]}, {"id": "TACO_0014", "nome": "Bolo mistura para", "categoria": "Doces e sobremesas", "medida": "1 porção", "porcaoG": 100, "kcal": 418.63, "carb": 84.71, "prot": 6.16, "gord": 6.13, "fibra": 1.7, "sodio": 462.88, "apto": true, "fonte": "TACO", "tags": ["sweet"]}, {"id": "TACO_0015", "nome": "Bolo pronto aipim", "categoria": "Tubérculos e raízes", "medida": "1 porção", "porcaoG": 100, "kcal": 323.85, "carb": 47.86, "prot": 4.42, "gord": 12.75, "fibra": 0.69, "sodio": 111.01, "apto": true, "fonte": "TACO", "tags": ["sweet", "starchy_vegetable"]}, {"id": "TACO_0016", "nome": "Bolo pronto chocolate", "categoria": "Doces e sobremesas", "medida": "1 porção", "porcaoG": 100, "kcal": 410.01, "carb": 54.72, "prot": 6.22, "gord": 18.47, "fibra": 1.43, "sodio": 283.3, "apto": true, "fonte": "TACO", "tags": ["sweet"]}, {"id": "TACO_0017", "nome": "Bolo pronto coco", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 333.44, "carb": 52.28, "prot": 5.67, "gord": 11.3, "fibra": 1.05, "sodio": 190.34, "apto": true, "fonte": "TACO", "tags": ["sweet"]}, {"id": "TACO_0018", "nome": "Bolo pronto milho", "categoria": "Cereais", "medida": "4 colheres de sopa", "porcaoG": 100, "kcal": 311.39, "carb": 45.11, "prot": 4.8, "gord": 12.41, "fibra": 0.71, "sodio": 133.81, "apto": true, "fonte": "TACO", "tags": ["sweet", "starchy_vegetable"]}, {"id": "TACO_0019", "nome": "Canjica branca crua", "categoria": "Preparações brasileiras", "medida": "1 porção", "porcaoG": 100, "kcal": 357.6, "carb": 78.06, "prot": 7.2, "gord": 0.97, "fibra": 5.5, "sodio": 0.79, "apto": true, "fonte": "TACO", "tags": ["home_preparation"]}, {"id": "TACO_0020", "nome": "Canjica com leite integral", "categoria": "Laticínios", "medida": "1 porção", "porcaoG": 100, "kcal": 112.46, "carb": 23.63, "prot": 2.36, "gord": 1.24, "fibra": 1.22, "sodio": 27.59, "apto": true, "fonte": "TACO", "tags": ["whole_grain", "dairy", "home_preparation"]}, {"id": "TACO_0021", "nome": "Cereais milho flocos com sal", "categoria": "Cereais", "medida": "4 colheres de sopa", "porcaoG": 100, "kcal": 369.6, "carb": 80.83, "prot": 7.29, "gord": 1.6, "fibra": 5.29, "sodio": 271.74, "apto": true, "fonte": "TACO", "tags": ["starchy_vegetable"]}, {"id": "TACO_0022", "nome": "Cereais milho flocos sem sal", "categoria": "Cereais", "medida": "4 colheres de sopa", "porcaoG": 100, "kcal": 363.34, "carb": 80.45, "prot": 6.88, "gord": 1.18, "fibra": 1.84, "sodio": 30.97, "apto": true, "fonte": "TACO", "tags": ["starchy_vegetable"]}, {"id": "TACO_0023", "nome": "Cereais mingau milho infantil", "categoria": "Cereais", "medida": "4 colheres de sopa", "porcaoG": 100, "kcal": 394.43, "carb": 87.27, "prot": 6.43, "gord": 1.09, "fibra": 3.21, "sodio": 399.4, "apto": true, "fonte": "TACO", "tags": ["starchy_vegetable"]}, {"id": "TACO_0024", "nome": "Cereais mistura para vitamina trigo cevada e aveia", "categoria": "Cereais", "medida": "4 colheres de sopa", "porcaoG": 100, "kcal": 381.13, "carb": 81.62, "prot": 8.9, "gord": 2.12, "fibra": 4.98, "sodio": 1163.26, "apto": true, "fonte": "TACO", "tags": ["whole_grain"]}, {"id": "TACO_0025", "nome": "Cereal matinal milho", "categoria": "Cereais", "medida": "4 colheres de sopa", "porcaoG": 100, "kcal": 365.35, "carb": 83.82, "prot": 7.16, "gord": 0.96, "fibra": 4.12, "sodio": 654.54, "apto": true, "fonte": "TACO", "tags": ["starchy_vegetable"]}, {"id": "TACO_0026", "nome": "Cereal matinal milho açúcar", "categoria": "Cereais", "medida": "4 colheres de sopa", "porcaoG": 100, "kcal": 376.56, "carb": 88.84, "prot": 4.74, "gord": 0.67, "fibra": 2.11, "sodio": 405.31, "apto": true, "fonte": "TACO", "tags": ["sweet", "starchy_vegetable"]}, {"id": "TACO_0027", "nome": "Creme de arroz pó", "categoria": "Cereais", "medida": "4 colheres de sopa", "porcaoG": 100, "kcal": 386.0, "carb": 83.87, "prot": 7.03, "gord": 1.23, "fibra": 1.07, "sodio": 1.03, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0028", "nome": "Creme de milho pó", "categoria": "Cereais", "medida": "4 colheres de sopa", "porcaoG": 100, "kcal": 333.03, "carb": 86.15, "prot": 4.82, "gord": 1.64, "fibra": 3.72, "sodio": 593.79, "apto": true, "fonte": "TACO", "tags": ["starchy_vegetable"]}, {"id": "TACO_0029", "nome": "Curau milho verde", "categoria": "Cereais", "medida": "4 colheres de sopa", "porcaoG": 100, "kcal": 78.43, "carb": 13.94, "prot": 2.36, "gord": 1.64, "fibra": 0.46, "sodio": 20.51, "apto": true, "fonte": "TACO", "tags": ["starchy_vegetable"]}, {"id": "TACO_0030", "nome": "Curau milho verde mistura para", "categoria": "Cereais", "medida": "4 colheres de sopa", "porcaoG": 100, "kcal": 402.29, "carb": 79.82, "prot": 2.22, "gord": 13.37, "fibra": 2.52, "sodio": 222.93, "apto": true, "fonte": "TACO", "tags": ["starchy_vegetable"]}, {"id": "TACO_0031", "nome": "Farinha de arroz enriquecida", "categoria": "Cereais", "medida": "4 colheres de sopa", "porcaoG": 100, "kcal": 363.06, "carb": 85.5, "prot": 1.27, "gord": 0.3, "fibra": 0.58, "sodio": 17.1, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0032", "nome": "Farinha de centeio integral", "categoria": "Cereais", "medida": "4 colheres de sopa", "porcaoG": 100, "kcal": 335.78, "carb": 73.3, "prot": 12.52, "gord": 1.75, "fibra": 15.48, "sodio": 41.38, "apto": true, "fonte": "TACO", "tags": ["whole_grain"]}, {"id": "TACO_0033", "nome": "Farinha de milho amarela", "categoria": "Cereais", "medida": "4 colheres de sopa", "porcaoG": 100, "kcal": 350.59, "carb": 79.08, "prot": 7.19, "gord": 1.47, "fibra": 5.49, "sodio": 44.93, "apto": true, "fonte": "TACO", "tags": ["starchy_vegetable"]}, {"id": "TACO_0034", "nome": "Farinha de rosca", "categoria": "Cereais", "medida": "4 colheres de sopa", "porcaoG": 100, "kcal": 370.58, "carb": 75.79, "prot": 11.38, "gord": 1.46, "fibra": 4.82, "sodio": 332.5, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0035", "nome": "Farinha de trigo", "categoria": "Cereais", "medida": "4 colheres de sopa", "porcaoG": 100, "kcal": 360.47, "carb": 75.09, "prot": 9.79, "gord": 1.37, "fibra": 2.35, "sodio": 0.74, "apto": true, "fonte": "TACO", "tags": ["refined_grain"]}, {"id": "TACO_0036", "nome": "Farinha láctea de cereais", "categoria": "Cereais", "medida": "4 colheres de sopa", "porcaoG": 100, "kcal": 414.85, "carb": 77.77, "prot": 11.88, "gord": 5.79, "fibra": 1.94, "sodio": 125.07, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0037", "nome": "Lasanha massa fresca cozida", "categoria": "Cereais", "medida": "4 colheres de sopa", "porcaoG": 100, "kcal": 163.76, "carb": 32.52, "prot": 5.81, "gord": 1.16, "fibra": 1.64, "sodio": 206.77, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0038", "nome": "Lasanha massa fresca crua", "categoria": "Cereais", "medida": "4 colheres de sopa", "porcaoG": 100, "kcal": 220.31, "carb": 45.06, "prot": 7.01, "gord": 1.34, "fibra": 1.61, "sodio": 666.71, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0039", "nome": "Macarrão instantâneo", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 435.86, "carb": 62.43, "prot": 8.79, "gord": 17.24, "fibra": 5.61, "sodio": 1515.53, "apto": true, "fonte": "TACO", "tags": ["fruit", "refined_grain"]}, {"id": "TACO_0040", "nome": "Macarrão trigo cru", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 371.12, "carb": 77.94, "prot": 10.0, "gord": 1.3, "fibra": 2.93, "sodio": 7.17, "apto": true, "fonte": "TACO", "tags": ["fruit", "refined_grain"]}, {"id": "TACO_0041", "nome": "Macarrão trigo cru com ovos", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 370.57, "carb": 76.62, "prot": 10.32, "gord": 1.97, "fibra": 2.3, "sodio": 14.74, "apto": true, "fonte": "TACO", "tags": ["fruit", "refined_grain"]}, {"id": "TACO_0042", "nome": "Milho amido cru", "categoria": "Cereais", "medida": "4 colheres de sopa", "porcaoG": 100, "kcal": 361.37, "carb": 87.15, "prot": 0.6, "gord": 0.0, "fibra": 0.74, "sodio": 8.08, "apto": true, "fonte": "TACO", "tags": ["starchy_vegetable"]}, {"id": "TACO_0043", "nome": "Milho fubá cru", "categoria": "Cereais", "medida": "4 colheres de sopa", "porcaoG": 100, "kcal": 353.48, "carb": 78.87, "prot": 7.21, "gord": 1.9, "fibra": 4.71, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": ["starchy_vegetable", "refined_grain"]}, {"id": "TACO_0044", "nome": "Milho verde cru", "categoria": "Cereais", "medida": "4 colheres de sopa", "porcaoG": 100, "kcal": 138.17, "carb": 28.56, "prot": 6.59, "gord": 0.61, "fibra": 3.92, "sodio": 1.12, "apto": true, "fonte": "TACO", "tags": ["starchy_vegetable"]}, {"id": "TACO_0045", "nome": "Milho verde enlatado drenado", "categoria": "Cereais", "medida": "4 colheres de sopa", "porcaoG": 100, "kcal": 97.56, "carb": 17.14, "prot": 3.23, "gord": 2.35, "fibra": 4.64, "sodio": 260.35, "apto": true, "fonte": "TACO", "tags": ["starchy_vegetable"]}, {"id": "TACO_0046", "nome": "Mingau tradicional pó", "categoria": "Outros", "medida": "1 porção", "porcaoG": 100, "kcal": 373.42, "carb": 89.34, "prot": 0.58, "gord": 0.37, "fibra": 0.88, "sodio": 14.86, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0047", "nome": "Pamonha barra para cozimento pré-cozida", "categoria": "Outros", "medida": "1 porção", "porcaoG": 100, "kcal": 171.22, "carb": 30.68, "prot": 2.55, "gord": 4.85, "fibra": 2.37, "sodio": 131.99, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0048", "nome": "Pão aveia forma", "categoria": "Cereais", "medida": "4 colheres de sopa", "porcaoG": 100, "kcal": 343.09, "carb": 59.57, "prot": 12.35, "gord": 5.69, "fibra": 5.98, "sodio": 605.76, "apto": true, "fonte": "TACO", "tags": ["whole_grain"]}, {"id": "TACO_0049", "nome": "Pão de soja", "categoria": "Leguminosas", "medida": "1 concha", "porcaoG": 100, "kcal": 308.73, "carb": 56.51, "prot": 11.34, "gord": 3.58, "fibra": 5.71, "sodio": 662.54, "apto": true, "fonte": "TACO", "tags": ["legume"]}, {"id": "TACO_0050", "nome": "Pão glúten forma", "categoria": "Pães", "medida": "1 fatia", "porcaoG": 100, "kcal": 252.99, "carb": 44.12, "prot": 11.95, "gord": 2.73, "fibra": 2.48, "sodio": 22.05, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0051", "nome": "Pão milho forma", "categoria": "Cereais", "medida": "4 colheres de sopa", "porcaoG": 100, "kcal": 292.01, "carb": 56.4, "prot": 8.3, "gord": 3.11, "fibra": 4.3, "sodio": 506.64, "apto": true, "fonte": "TACO", "tags": ["starchy_vegetable"]}, {"id": "TACO_0052", "nome": "Pão trigo forma integral", "categoria": "Cereais", "medida": "4 colheres de sopa", "porcaoG": 100, "kcal": 253.19, "carb": 49.94, "prot": 9.43, "gord": 3.65, "fibra": 6.88, "sodio": 506.1, "apto": true, "fonte": "TACO", "tags": ["whole_grain"]}, {"id": "TACO_0053", "nome": "Pão trigo francês", "categoria": "Cereais", "medida": "4 colheres de sopa", "porcaoG": 100, "kcal": 299.81, "carb": 58.65, "prot": 7.95, "gord": 3.1, "fibra": 2.31, "sodio": 647.67, "apto": true, "fonte": "TACO", "tags": ["refined_grain"]}, {"id": "TACO_0054", "nome": "Pão trigo sovado", "categoria": "Cereais", "medida": "4 colheres de sopa", "porcaoG": 100, "kcal": 310.96, "carb": 61.45, "prot": 8.4, "gord": 2.84, "fibra": 2.43, "sodio": 430.79, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0055", "nome": "Pastel de carne cru", "categoria": "Outros", "medida": "1 porção", "porcaoG": 100, "kcal": 288.7, "carb": 42.02, "prot": 10.74, "gord": 8.79, "fibra": 1.04, "sodio": 1309.27, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0056", "nome": "Pastel de carne frito", "categoria": "Outros", "medida": "1 porção", "porcaoG": 100, "kcal": 388.37, "carb": 43.77, "prot": 10.1, "gord": 20.14, "fibra": 0.99, "sodio": 1039.89, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0057", "nome": "Pastel de queijo cru", "categoria": "Laticínios", "medida": "1 porção", "porcaoG": 100, "kcal": 308.47, "carb": 45.95, "prot": 9.85, "gord": 9.63, "fibra": 1.11, "sodio": 984.57, "apto": true, "fonte": "TACO", "tags": ["dairy"]}, {"id": "TACO_0058", "nome": "Pastel de queijo frito", "categoria": "Laticínios", "medida": "1 porção", "porcaoG": 100, "kcal": 422.11, "carb": 48.13, "prot": 8.71, "gord": 22.67, "fibra": 0.94, "sodio": 821.38, "apto": true, "fonte": "TACO", "tags": ["dairy"]}, {"id": "TACO_0059", "nome": "Pastel massa crua", "categoria": "Cereais", "medida": "4 colheres de sopa", "porcaoG": 100, "kcal": 310.2, "carb": 57.38, "prot": 6.9, "gord": 5.48, "fibra": 1.41, "sodio": 1344.2, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0060", "nome": "Pastel massa frita", "categoria": "Cereais", "medida": "4 colheres de sopa", "porcaoG": 100, "kcal": 569.67, "carb": 49.34, "prot": 6.02, "gord": 40.86, "fibra": 1.31, "sodio": 1174.67, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0061", "nome": "Pipoca com óleo de soja sem sal", "categoria": "Leguminosas", "medida": "1 concha", "porcaoG": 100, "kcal": 448.33, "carb": 70.31, "prot": 9.93, "gord": 15.94, "fibra": 14.34, "sodio": 4.32, "apto": true, "fonte": "TACO", "tags": ["legume"]}, {"id": "TACO_0062", "nome": "Polenta pré-cozida", "categoria": "Cereais", "medida": "4 colheres de sopa", "porcaoG": 100, "kcal": 102.74, "carb": 23.31, "prot": 2.29, "gord": 0.3, "fibra": 2.4, "sodio": 441.89, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0063", "nome": "Torrada pão francês", "categoria": "Pães", "medida": "1 fatia", "porcaoG": 100, "kcal": 377.42, "carb": 74.56, "prot": 10.52, "gord": 3.3, "fibra": 3.4, "sodio": 829.49, "apto": true, "fonte": "TACO", "tags": ["refined_grain"]}, {"id": "TACO_0064", "nome": "Abóbora cabotian cozida", "categoria": "Verduras e legumes", "medida": "1 porção", "porcaoG": 100, "kcal": 48.04, "carb": 10.76, "prot": 1.44, "gord": 0.73, "fibra": 2.46, "sodio": 1.45, "apto": true, "fonte": "TACO", "tags": ["starchy_vegetable"]}, {"id": "TACO_0065", "nome": "Abóbora cabotian crua", "categoria": "Verduras e legumes", "medida": "1 porção", "porcaoG": 100, "kcal": 38.6, "carb": 8.36, "prot": 1.75, "gord": 0.54, "fibra": 2.17, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": ["starchy_vegetable"]}, {"id": "TACO_0066", "nome": "Abóbora menina brasileira crua", "categoria": "Verduras e legumes", "medida": "1 porção", "porcaoG": 100, "kcal": 13.61, "carb": 3.3, "prot": 0.61, "gord": 0.0, "fibra": 1.17, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": ["starchy_vegetable"]}, {"id": "TACO_0067", "nome": "Abóbora moranga crua", "categoria": "Verduras e legumes", "medida": "1 porção", "porcaoG": 100, "kcal": 12.36, "carb": 2.67, "prot": 0.96, "gord": 0.06, "fibra": 1.7, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": ["starchy_vegetable"]}, {"id": "TACO_0068", "nome": "Abóbora moranga refogada", "categoria": "Verduras e legumes", "medida": "1 porção", "porcaoG": 100, "kcal": 29.0, "carb": 5.98, "prot": 0.39, "gord": 0.8, "fibra": 1.55, "sodio": 3.03, "apto": true, "fonte": "TACO", "tags": ["starchy_vegetable", "home_preparation"]}, {"id": "TACO_0069", "nome": "Abóbora pescoço crua", "categoria": "Verduras e legumes", "medida": "1 porção", "porcaoG": 100, "kcal": 24.47, "carb": 6.12, "prot": 0.67, "gord": 0.12, "fibra": 2.3, "sodio": 0.74, "apto": true, "fonte": "TACO", "tags": ["starchy_vegetable"]}, {"id": "TACO_0070", "nome": "Abobrinha italiana cozida", "categoria": "Verduras e legumes", "medida": "1 porção", "porcaoG": 100, "kcal": 15.04, "carb": 2.98, "prot": 1.12, "gord": 0.2, "fibra": 1.59, "sodio": 0.83, "apto": true, "fonte": "TACO", "tags": ["non_starchy_vegetable"]}, {"id": "TACO_0071", "nome": "Abobrinha italiana crua", "categoria": "Verduras e legumes", "medida": "1 porção", "porcaoG": 100, "kcal": 19.28, "carb": 4.29, "prot": 1.14, "gord": 0.14, "fibra": 1.35, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": ["non_starchy_vegetable"]}, {"id": "TACO_0072", "nome": "Abobrinha italiana refogada", "categoria": "Verduras e legumes", "medida": "1 porção", "porcaoG": 100, "kcal": 24.43, "carb": 4.19, "prot": 1.07, "gord": 0.82, "fibra": 1.38, "sodio": 2.21, "apto": true, "fonte": "TACO", "tags": ["non_starchy_vegetable", "home_preparation"]}, {"id": "TACO_0073", "nome": "Abobrinha paulista crua", "categoria": "Verduras e legumes", "medida": "1 porção", "porcaoG": 100, "kcal": 30.81, "carb": 7.87, "prot": 0.64, "gord": 0.14, "fibra": 2.6, "sodio": 0.5, "apto": true, "fonte": "TACO", "tags": ["non_starchy_vegetable"]}, {"id": "TACO_0074", "nome": "Acelga crua", "categoria": "Verduras e legumes", "medida": "1 porção", "porcaoG": 100, "kcal": 20.94, "carb": 4.63, "prot": 1.44, "gord": 0.11, "fibra": 1.12, "sodio": 1.18, "apto": true, "fonte": "TACO", "tags": ["non_starchy_vegetable"]}, {"id": "TACO_0075", "nome": "Agrião cru", "categoria": "Verduras e legumes", "medida": "1 porção", "porcaoG": 100, "kcal": 16.58, "carb": 2.25, "prot": 2.69, "gord": 0.24, "fibra": 2.14, "sodio": 7.46, "apto": true, "fonte": "TACO", "tags": ["non_starchy_vegetable"]}, {"id": "TACO_0076", "nome": "Aipo cru", "categoria": "Verduras, hortaliças e derivados", "medida": "1 porção", "porcaoG": 100, "kcal": 19.09, "carb": 4.27, "prot": 0.76, "gord": 0.07, "fibra": 0.96, "sodio": 9.52, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0077", "nome": "Alface americana crua", "categoria": "Verduras e legumes", "medida": "1 porção", "porcaoG": 100, "kcal": 8.79, "carb": 1.75, "prot": 0.61, "gord": 0.13, "fibra": 1.02, "sodio": 7.31, "apto": true, "fonte": "TACO", "tags": ["non_starchy_vegetable"]}, {"id": "TACO_0078", "nome": "Alface crespa crua", "categoria": "Verduras e legumes", "medida": "1 porção", "porcaoG": 100, "kcal": 10.68, "carb": 1.7, "prot": 1.35, "gord": 0.16, "fibra": 1.83, "sodio": 3.38, "apto": true, "fonte": "TACO", "tags": ["non_starchy_vegetable"]}, {"id": "TACO_0079", "nome": "Alface lisa crua", "categoria": "Verduras e legumes", "medida": "1 porção", "porcaoG": 100, "kcal": 13.82, "carb": 2.43, "prot": 1.69, "gord": 0.12, "fibra": 2.33, "sodio": 4.23, "apto": true, "fonte": "TACO", "tags": ["non_starchy_vegetable"]}, {"id": "TACO_0080", "nome": "Alface roxa crua", "categoria": "Verduras e legumes", "medida": "1 porção", "porcaoG": 100, "kcal": 12.72, "carb": 2.49, "prot": 0.91, "gord": 0.19, "fibra": 2.01, "sodio": 7.12, "apto": true, "fonte": "TACO", "tags": ["non_starchy_vegetable"]}, {"id": "TACO_0081", "nome": "Alfavaca crua", "categoria": "Verduras, hortaliças e derivados", "medida": "1 porção", "porcaoG": 100, "kcal": 29.18, "carb": 5.24, "prot": 2.66, "gord": 0.48, "fibra": 4.14, "sodio": 4.55, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0082", "nome": "Alho cru", "categoria": "Temperos e condimentos", "medida": "1 porção", "porcaoG": 100, "kcal": 113.13, "carb": 23.91, "prot": 7.01, "gord": 0.22, "fibra": 4.32, "sodio": 5.36, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0083", "nome": "Alho-poró cru", "categoria": "Temperos e condimentos", "medida": "1 porção", "porcaoG": 100, "kcal": 31.51, "carb": 6.88, "prot": 1.41, "gord": 0.14, "fibra": 2.51, "sodio": 1.76, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0084", "nome": "Almeirão cru", "categoria": "Verduras, hortaliças e derivados", "medida": "1 porção", "porcaoG": 100, "kcal": 18.03, "carb": 3.34, "prot": 1.77, "gord": 0.22, "fibra": 2.59, "sodio": 2.35, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0085", "nome": "Almeirão refogado", "categoria": "Verduras, hortaliças e derivados", "medida": "1 porção", "porcaoG": 100, "kcal": 65.08, "carb": 5.7, "prot": 1.7, "gord": 4.85, "fibra": 3.43, "sodio": 14.52, "apto": true, "fonte": "TACO", "tags": ["home_preparation"]}, {"id": "TACO_0086", "nome": "Batata baroa cozida", "categoria": "Tubérculos e raízes", "medida": "1 porção", "porcaoG": 100, "kcal": 80.12, "carb": 18.95, "prot": 0.85, "gord": 0.17, "fibra": 1.76, "sodio": 2.1, "apto": true, "fonte": "TACO", "tags": ["starchy_vegetable"]}, {"id": "TACO_0087", "nome": "Batata baroa crua", "categoria": "Tubérculos e raízes", "medida": "1 porção", "porcaoG": 100, "kcal": 100.98, "carb": 23.98, "prot": 1.05, "gord": 0.17, "fibra": 2.06, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": ["starchy_vegetable"]}, {"id": "TACO_0088", "nome": "Batata doce cozida", "categoria": "Tubérculos e raízes", "medida": "1 porção", "porcaoG": 100, "kcal": 76.76, "carb": 18.42, "prot": 0.64, "gord": 0.09, "fibra": 2.21, "sodio": 2.7, "apto": true, "fonte": "TACO", "tags": ["sweet", "starchy_vegetable"]}, {"id": "TACO_0089", "nome": "Batata doce crua", "categoria": "Tubérculos e raízes", "medida": "1 porção", "porcaoG": 100, "kcal": 118.24, "carb": 28.2, "prot": 1.26, "gord": 0.13, "fibra": 2.57, "sodio": 8.77, "apto": true, "fonte": "TACO", "tags": ["sweet", "starchy_vegetable"]}, {"id": "TACO_0090", "nome": "Batata frita tipo chips industrializada", "categoria": "Tubérculos e raízes", "medida": "1 porção", "porcaoG": 100, "kcal": 542.73, "carb": 51.22, "prot": 5.58, "gord": 36.62, "fibra": 2.46, "sodio": 607.4, "apto": true, "fonte": "TACO", "tags": ["starchy_vegetable"]}, {"id": "TACO_0091", "nome": "Batata inglesa cozida", "categoria": "Tubérculos e raízes", "medida": "1 porção", "porcaoG": 100, "kcal": 51.59, "carb": 11.94, "prot": 1.16, "gord": 0.0, "fibra": 1.34, "sodio": 2.29, "apto": true, "fonte": "TACO", "tags": ["starchy_vegetable"]}, {"id": "TACO_0092", "nome": "Batata inglesa crua", "categoria": "Tubérculos e raízes", "medida": "1 porção", "porcaoG": 100, "kcal": 64.37, "carb": 14.69, "prot": 1.77, "gord": 0.0, "fibra": 1.16, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": ["starchy_vegetable"]}, {"id": "TACO_0093", "nome": "Batata inglesa frita", "categoria": "Tubérculos e raízes", "medida": "1 porção", "porcaoG": 100, "kcal": 267.16, "carb": 35.64, "prot": 4.97, "gord": 13.11, "fibra": 8.06, "sodio": 1.91, "apto": true, "fonte": "TACO", "tags": ["starchy_vegetable"]}, {"id": "TACO_0094", "nome": "Batata inglesa sauté", "categoria": "Tubérculos e raízes", "medida": "1 porção", "porcaoG": 100, "kcal": 67.89, "carb": 14.09, "prot": 1.29, "gord": 0.9, "fibra": 1.38, "sodio": 8.18, "apto": true, "fonte": "TACO", "tags": ["starchy_vegetable"]}, {"id": "TACO_0095", "nome": "Berinjela cozida", "categoria": "Verduras e legumes", "medida": "1 porção", "porcaoG": 100, "kcal": 18.85, "carb": 4.47, "prot": 0.68, "gord": 0.15, "fibra": 2.52, "sodio": 1.32, "apto": true, "fonte": "TACO", "tags": ["non_starchy_vegetable"]}, {"id": "TACO_0096", "nome": "Berinjela crua", "categoria": "Verduras e legumes", "medida": "1 porção", "porcaoG": 100, "kcal": 19.63, "carb": 4.43, "prot": 1.22, "gord": 0.1, "fibra": 2.87, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": ["non_starchy_vegetable"]}, {"id": "TACO_0097", "nome": "Beterraba cozida", "categoria": "Verduras e legumes", "medida": "1 porção", "porcaoG": 100, "kcal": 32.15, "carb": 7.23, "prot": 1.29, "gord": 0.09, "fibra": 1.88, "sodio": 22.76, "apto": true, "fonte": "TACO", "tags": ["starchy_vegetable"]}, {"id": "TACO_0098", "nome": "Beterraba crua", "categoria": "Verduras e legumes", "medida": "1 porção", "porcaoG": 100, "kcal": 48.83, "carb": 11.11, "prot": 1.95, "gord": 0.09, "fibra": 3.37, "sodio": 9.72, "apto": true, "fonte": "TACO", "tags": ["starchy_vegetable"]}, {"id": "TACO_0099", "nome": "Biscoito polvilho doce", "categoria": "Outros", "medida": "1 porção", "porcaoG": 100, "kcal": 437.55, "carb": 80.54, "prot": 1.29, "gord": 12.25, "fibra": 1.16, "sodio": 97.8, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0100", "nome": "Brócolis cozido", "categoria": "Verduras e legumes", "medida": "1 porção", "porcaoG": 100, "kcal": 24.64, "carb": 4.37, "prot": 2.13, "gord": 0.46, "fibra": 3.42, "sodio": 2.12, "apto": true, "fonte": "TACO", "tags": ["non_starchy_vegetable"]}, {"id": "TACO_0101", "nome": "Brócolis cru", "categoria": "Verduras e legumes", "medida": "1 porção", "porcaoG": 100, "kcal": 25.5, "carb": 4.03, "prot": 3.64, "gord": 0.27, "fibra": 2.88, "sodio": 3.33, "apto": true, "fonte": "TACO", "tags": ["non_starchy_vegetable"]}, {"id": "TACO_0102", "nome": "Cará cozido", "categoria": "Tubérculos e raízes", "medida": "1 porção", "porcaoG": 100, "kcal": 77.58, "carb": 18.85, "prot": 1.53, "gord": 0.11, "fibra": 2.63, "sodio": 1.01, "apto": true, "fonte": "TACO", "tags": ["starchy_vegetable"]}, {"id": "TACO_0103", "nome": "Cará cru", "categoria": "Tubérculos e raízes", "medida": "1 porção", "porcaoG": 100, "kcal": 95.63, "carb": 22.95, "prot": 2.28, "gord": 0.14, "fibra": 7.27, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": ["starchy_vegetable"]}, {"id": "TACO_0104", "nome": "Caruru cru", "categoria": "Outros", "medida": "1 porção", "porcaoG": 100, "kcal": 34.03, "carb": 5.97, "prot": 3.2, "gord": 0.58, "fibra": 4.47, "sodio": 13.66, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0105", "nome": "Catalonha crua", "categoria": "Outros", "medida": "1 porção", "porcaoG": 100, "kcal": 23.89, "carb": 4.75, "prot": 1.87, "gord": 0.28, "fibra": 2.05, "sodio": 9.39, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0106", "nome": "Catalonha refogada", "categoria": "Outros", "medida": "1 porção", "porcaoG": 100, "kcal": 63.45, "carb": 4.81, "prot": 1.95, "gord": 4.81, "fibra": 3.65, "sodio": 24.72, "apto": true, "fonte": "TACO", "tags": ["home_preparation"]}, {"id": "TACO_0107", "nome": "Cebola crua", "categoria": "Temperos e condimentos", "medida": "1 porção", "porcaoG": 100, "kcal": 39.42, "carb": 8.85, "prot": 1.71, "gord": 0.08, "fibra": 2.19, "sodio": 0.6, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0108", "nome": "Cebolinha crua", "categoria": "Temperos e condimentos", "medida": "1 porção", "porcaoG": 100, "kcal": 19.52, "carb": 3.37, "prot": 1.87, "gord": 0.35, "fibra": 3.55, "sodio": 1.6, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0109", "nome": "Cenoura cozida", "categoria": "Verduras e legumes", "medida": "1 porção", "porcaoG": 100, "kcal": 29.86, "carb": 6.69, "prot": 0.85, "gord": 0.22, "fibra": 2.63, "sodio": 7.88, "apto": true, "fonte": "TACO", "tags": ["starchy_vegetable"]}, {"id": "TACO_0110", "nome": "Cenoura crua", "categoria": "Verduras e legumes", "medida": "1 porção", "porcaoG": 100, "kcal": 34.14, "carb": 7.66, "prot": 1.32, "gord": 0.17, "fibra": 3.18, "sodio": 3.33, "apto": true, "fonte": "TACO", "tags": ["starchy_vegetable"]}, {"id": "TACO_0111", "nome": "Chicória crua", "categoria": "Outros", "medida": "1 porção", "porcaoG": 100, "kcal": 13.84, "carb": 2.85, "prot": 1.14, "gord": 0.14, "fibra": 2.2, "sodio": 13.52, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0112", "nome": "Chuchu cozido", "categoria": "Verduras e legumes", "medida": "1 porção", "porcaoG": 100, "kcal": 18.54, "carb": 4.79, "prot": 0.41, "gord": 0.0, "fibra": 1.04, "sodio": 1.81, "apto": true, "fonte": "TACO", "tags": ["non_starchy_vegetable"]}, {"id": "TACO_0113", "nome": "Chuchu cru", "categoria": "Verduras e legumes", "medida": "1 porção", "porcaoG": 100, "kcal": 16.98, "carb": 4.14, "prot": 0.7, "gord": 0.06, "fibra": 1.28, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": ["non_starchy_vegetable"]}, {"id": "TACO_0114", "nome": "Coentro folhas desidratadas", "categoria": "Outros", "medida": "1 porção", "porcaoG": 100, "kcal": 309.07, "carb": 47.95, "prot": 20.88, "gord": 10.39, "fibra": 37.29, "sodio": 18.26, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0115", "nome": "Couve manteiga crua", "categoria": "Verduras e legumes", "medida": "1 porção", "porcaoG": 100, "kcal": 27.06, "carb": 4.33, "prot": 2.87, "gord": 0.55, "fibra": 3.12, "sodio": 6.17, "apto": true, "fonte": "TACO", "tags": ["non_starchy_vegetable"]}, {"id": "TACO_0116", "nome": "Couve manteiga refogada", "categoria": "Verduras e legumes", "medida": "1 porção", "porcaoG": 100, "kcal": 90.34, "carb": 8.71, "prot": 1.67, "gord": 6.59, "fibra": 5.74, "sodio": 11.45, "apto": true, "fonte": "TACO", "tags": ["non_starchy_vegetable", "home_preparation"]}, {"id": "TACO_0117", "nome": "Couve-flor crua", "categoria": "Verduras e legumes", "medida": "1 porção", "porcaoG": 100, "kcal": 22.56, "carb": 4.52, "prot": 1.91, "gord": 0.21, "fibra": 2.35, "sodio": 3.44, "apto": true, "fonte": "TACO", "tags": ["non_starchy_vegetable"]}, {"id": "TACO_0118", "nome": "Couve-flor cozida", "categoria": "Verduras e legumes", "medida": "1 porção", "porcaoG": 100, "kcal": 19.11, "carb": 3.88, "prot": 1.24, "gord": 0.27, "fibra": 2.13, "sodio": 1.79, "apto": true, "fonte": "TACO", "tags": ["non_starchy_vegetable"]}, {"id": "TACO_0119", "nome": "Espinafre Nova Zelândia cru", "categoria": "Verduras e legumes", "medida": "1 porção", "porcaoG": 100, "kcal": 16.1, "carb": 2.57, "prot": 2.0, "gord": 0.24, "fibra": 2.1, "sodio": 17.09, "apto": true, "fonte": "TACO", "tags": ["non_starchy_vegetable"]}, {"id": "TACO_0120", "nome": "Espinafre Nova Zelândia refogado", "categoria": "Verduras e legumes", "medida": "1 porção", "porcaoG": 100, "kcal": 67.25, "carb": 4.24, "prot": 2.72, "gord": 5.43, "fibra": 2.52, "sodio": 47.02, "apto": true, "fonte": "TACO", "tags": ["non_starchy_vegetable", "home_preparation"]}, {"id": "TACO_0121", "nome": "Farinha de mandioca crua", "categoria": "Tubérculos e raízes", "medida": "1 porção", "porcaoG": 100, "kcal": 360.87, "carb": 87.9, "prot": 1.55, "gord": 0.28, "fibra": 6.39, "sodio": 1.02, "apto": true, "fonte": "TACO", "tags": ["starchy_vegetable"]}, {"id": "TACO_0122", "nome": "Farinha de mandioca torrada", "categoria": "Tubérculos e raízes", "medida": "1 porção", "porcaoG": 100, "kcal": 365.27, "carb": 89.19, "prot": 1.23, "gord": 0.29, "fibra": 6.54, "sodio": 10.31, "apto": true, "fonte": "TACO", "tags": ["starchy_vegetable"]}, {"id": "TACO_0123", "nome": "Farinha de puba", "categoria": "Cereais", "medida": "4 colheres de sopa", "porcaoG": 100, "kcal": 360.18, "carb": 87.29, "prot": 1.62, "gord": 0.47, "fibra": 4.24, "sodio": 3.61, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0124", "nome": "Fécula de mandioca", "categoria": "Tubérculos e raízes", "medida": "1 porção", "porcaoG": 100, "kcal": 330.85, "carb": 81.15, "prot": 0.52, "gord": 0.28, "fibra": 0.65, "sodio": 2.45, "apto": true, "fonte": "TACO", "tags": ["starchy_vegetable"]}, {"id": "TACO_0125", "nome": "Feijão broto cru", "categoria": "Leguminosas", "medida": "1 concha", "porcaoG": 100, "kcal": 38.72, "carb": 7.76, "prot": 4.17, "gord": 0.1, "fibra": 1.97, "sodio": 1.79, "apto": true, "fonte": "TACO", "tags": ["legume"]}, {"id": "TACO_0126", "nome": "Inhame cru", "categoria": "Tubérculos e raízes", "medida": "1 porção", "porcaoG": 100, "kcal": 96.7, "carb": 23.23, "prot": 2.05, "gord": 0.21, "fibra": 1.65, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": ["starchy_vegetable"]}, {"id": "TACO_0127", "nome": "Jiló cru", "categoria": "Verduras e legumes", "medida": "1 porção", "porcaoG": 100, "kcal": 27.37, "carb": 6.19, "prot": 1.4, "gord": 0.22, "fibra": 4.83, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": ["non_starchy_vegetable"]}, {"id": "TACO_0128", "nome": "Jurubeba crua", "categoria": "Outros", "medida": "1 porção", "porcaoG": 100, "kcal": 125.81, "carb": 23.06, "prot": 4.41, "gord": 3.91, "fibra": 23.92, "sodio": 0.77, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0129", "nome": "Mandioca cozida", "categoria": "Tubérculos e raízes", "medida": "1 porção", "porcaoG": 100, "kcal": 125.36, "carb": 30.09, "prot": 0.57, "gord": 0.3, "fibra": 1.56, "sodio": 0.91, "apto": true, "fonte": "TACO", "tags": ["starchy_vegetable"]}, {"id": "TACO_0130", "nome": "Mandioca crua", "categoria": "Tubérculos e raízes", "medida": "1 porção", "porcaoG": 100, "kcal": 151.42, "carb": 36.17, "prot": 1.13, "gord": 0.3, "fibra": 1.88, "sodio": 2.15, "apto": true, "fonte": "TACO", "tags": ["starchy_vegetable"]}, {"id": "TACO_0131", "nome": "Mandioca farofa temperada", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 405.69, "carb": 80.3, "prot": 2.06, "gord": 9.12, "fibra": 7.82, "sodio": 574.51, "apto": true, "fonte": "TACO", "tags": ["fruit", "starchy_vegetable", "home_preparation"]}, {"id": "TACO_0132", "nome": "Mandioca frita", "categoria": "Tubérculos e raízes", "medida": "1 porção", "porcaoG": 100, "kcal": 300.06, "carb": 50.25, "prot": 1.38, "gord": 11.2, "fibra": 1.87, "sodio": 8.94, "apto": true, "fonte": "TACO", "tags": ["starchy_vegetable"]}, {"id": "TACO_0133", "nome": "Manjericão cru", "categoria": "Outros", "medida": "1 porção", "porcaoG": 100, "kcal": 21.15, "carb": 3.64, "prot": 1.99, "gord": 0.39, "fibra": 3.31, "sodio": 3.89, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0134", "nome": "Maxixe cru", "categoria": "Outros", "medida": "1 porção", "porcaoG": 100, "kcal": 13.75, "carb": 2.73, "prot": 1.39, "gord": 0.07, "fibra": 2.19, "sodio": 10.99, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0135", "nome": "Mostarda folha crua", "categoria": "Outros", "medida": "1 porção", "porcaoG": 100, "kcal": 18.11, "carb": 3.24, "prot": 2.11, "gord": 0.17, "fibra": 1.89, "sodio": 2.88, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0136", "nome": "Nhoque batata cozido", "categoria": "Tubérculos e raízes", "medida": "1 porção", "porcaoG": 100, "kcal": 180.78, "carb": 36.78, "prot": 5.86, "gord": 1.94, "fibra": 1.78, "sodio": 7.07, "apto": true, "fonte": "TACO", "tags": ["starchy_vegetable"]}, {"id": "TACO_0137", "nome": "Nabo cru", "categoria": "Outros", "medida": "1 porção", "porcaoG": 100, "kcal": 18.19, "carb": 4.15, "prot": 1.2, "gord": 0.05, "fibra": 2.64, "sodio": 2.46, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0138", "nome": "Palmito juçara em conserva", "categoria": "Verduras e legumes", "medida": "1 porção", "porcaoG": 100, "kcal": 23.2, "carb": 4.33, "prot": 1.79, "gord": 0.4, "fibra": 3.15, "sodio": 513.82, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0139", "nome": "Palmito pupunha em conserva", "categoria": "Verduras e legumes", "medida": "1 porção", "porcaoG": 100, "kcal": 29.43, "carb": 5.51, "prot": 2.46, "gord": 0.45, "fibra": 2.55, "sodio": 562.69, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0140", "nome": "Pão de queijo assado", "categoria": "Pães", "medida": "1 fatia", "porcaoG": 100, "kcal": 363.08, "carb": 34.24, "prot": 5.12, "gord": 24.57, "fibra": 0.56, "sodio": 773.49, "apto": true, "fonte": "TACO", "tags": ["dairy"]}, {"id": "TACO_0141", "nome": "Pão de queijo cru", "categoria": "Pães", "medida": "1 fatia", "porcaoG": 100, "kcal": 294.54, "carb": 38.51, "prot": 3.65, "gord": 13.99, "fibra": 0.98, "sodio": 404.99, "apto": true, "fonte": "TACO", "tags": ["dairy"]}, {"id": "TACO_0142", "nome": "Pepino cru", "categoria": "Verduras e legumes", "medida": "1 porção", "porcaoG": 100, "kcal": 9.53, "carb": 2.04, "prot": 0.87, "gord": 0.0, "fibra": 1.12, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": ["non_starchy_vegetable"]}, {"id": "TACO_0143", "nome": "Pimentão amarelo cru", "categoria": "Verduras e legumes", "medida": "1 porção", "porcaoG": 100, "kcal": 27.93, "carb": 5.96, "prot": 1.22, "gord": 0.44, "fibra": 1.92, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": ["non_starchy_vegetable"]}, {"id": "TACO_0144", "nome": "Pimentão verde cru", "categoria": "Verduras e legumes", "medida": "1 porção", "porcaoG": 100, "kcal": 21.29, "carb": 4.89, "prot": 1.05, "gord": 0.15, "fibra": 2.56, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": ["non_starchy_vegetable"]}, {"id": "TACO_0145", "nome": "Pimentão vermelho cru", "categoria": "Verduras e legumes", "medida": "1 porção", "porcaoG": 100, "kcal": 23.28, "carb": 5.47, "prot": 1.04, "gord": 0.15, "fibra": 1.59, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": ["non_starchy_vegetable"]}, {"id": "TACO_0146", "nome": "Polvilho doce", "categoria": "Outros", "medida": "1 porção", "porcaoG": 100, "kcal": 351.23, "carb": 86.77, "prot": 0.43, "gord": 0.0, "fibra": 0.24, "sodio": 1.58, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0147", "nome": "Quiabo cru", "categoria": "Verduras e legumes", "medida": "1 porção", "porcaoG": 100, "kcal": 29.94, "carb": 6.37, "prot": 1.92, "gord": 0.3, "fibra": 4.55, "sodio": 0.89, "apto": true, "fonte": "TACO", "tags": ["non_starchy_vegetable"]}, {"id": "TACO_0148", "nome": "Rabanete cru", "categoria": "Outros", "medida": "1 porção", "porcaoG": 100, "kcal": 13.74, "carb": 2.73, "prot": 1.39, "gord": 0.07, "fibra": 2.19, "sodio": 10.99, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0149", "nome": "Repolho branco cru", "categoria": "Verduras e legumes", "medida": "1 porção", "porcaoG": 100, "kcal": 17.12, "carb": 3.86, "prot": 0.88, "gord": 0.14, "fibra": 1.89, "sodio": 3.64, "apto": true, "fonte": "TACO", "tags": ["non_starchy_vegetable"]}, {"id": "TACO_0150", "nome": "Repolho roxo cru", "categoria": "Verduras e legumes", "medida": "1 porção", "porcaoG": 100, "kcal": 30.91, "carb": 7.2, "prot": 1.91, "gord": 0.06, "fibra": 1.97, "sodio": 2.34, "apto": true, "fonte": "TACO", "tags": ["non_starchy_vegetable"]}, {"id": "TACO_0151", "nome": "Repolho roxo refogado", "categoria": "Verduras e legumes", "medida": "1 porção", "porcaoG": 100, "kcal": 41.77, "carb": 7.56, "prot": 1.8, "gord": 1.24, "fibra": 1.75, "sodio": 3.42, "apto": true, "fonte": "TACO", "tags": ["non_starchy_vegetable", "home_preparation"]}, {"id": "TACO_0152", "nome": "Rúcula crua", "categoria": "Verduras e legumes", "medida": "1 porção", "porcaoG": 100, "kcal": 13.13, "carb": 2.22, "prot": 1.77, "gord": 0.11, "fibra": 1.74, "sodio": 9.42, "apto": true, "fonte": "TACO", "tags": ["non_starchy_vegetable"]}, {"id": "TACO_0153", "nome": "Salsa crua", "categoria": "Temperos e condimentos", "medida": "1 porção", "porcaoG": 100, "kcal": 33.42, "carb": 5.71, "prot": 3.26, "gord": 0.61, "fibra": 1.85, "sodio": 2.3, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0154", "nome": "Seleta de legumes enlatada", "categoria": "Verduras e legumes", "medida": "1 porção", "porcaoG": 100, "kcal": 56.53, "carb": 12.67, "prot": 3.42, "gord": 0.35, "fibra": 3.09, "sodio": 398.14, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0155", "nome": "Serralha crua", "categoria": "Outros", "medida": "1 porção", "porcaoG": 100, "kcal": 30.4, "carb": 4.95, "prot": 2.67, "gord": 0.74, "fibra": 3.52, "sodio": 19.35, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0156", "nome": "Taioba crua", "categoria": "Outros", "medida": "1 porção", "porcaoG": 100, "kcal": 34.21, "carb": 5.43, "prot": 2.9, "gord": 0.93, "fibra": 4.45, "sodio": 1.16, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0157", "nome": "Tomate com semente cru", "categoria": "Verduras e legumes", "medida": "1 porção", "porcaoG": 100, "kcal": 15.34, "carb": 3.14, "prot": 1.1, "gord": 0.17, "fibra": 1.17, "sodio": 1.02, "apto": true, "fonte": "TACO", "tags": ["non_starchy_vegetable"]}, {"id": "TACO_0158", "nome": "Tomate extrato", "categoria": "Verduras e legumes", "medida": "1 porção", "porcaoG": 100, "kcal": 60.93, "carb": 14.96, "prot": 2.43, "gord": 0.19, "fibra": 2.8, "sodio": 497.93, "apto": true, "fonte": "TACO", "tags": ["non_starchy_vegetable"]}, {"id": "TACO_0159", "nome": "Tomate molho industrializado", "categoria": "Verduras e legumes", "medida": "1 porção", "porcaoG": 100, "kcal": 38.45, "carb": 7.71, "prot": 1.38, "gord": 0.9, "fibra": 3.12, "sodio": 418.28, "apto": true, "fonte": "TACO", "tags": ["non_starchy_vegetable"]}, {"id": "TACO_0160", "nome": "Tomate purê", "categoria": "Verduras e legumes", "medida": "1 porção", "porcaoG": 100, "kcal": 27.94, "carb": 6.89, "prot": 1.36, "gord": 0.0, "fibra": 1.03, "sodio": 103.93, "apto": true, "fonte": "TACO", "tags": ["non_starchy_vegetable"]}, {"id": "TACO_0161", "nome": "Tomate salada", "categoria": "Verduras e legumes", "medida": "1 porção", "porcaoG": 100, "kcal": 20.55, "carb": 5.12, "prot": 0.81, "gord": 0.0, "fibra": 2.27, "sodio": 5.24, "apto": true, "fonte": "TACO", "tags": ["non_starchy_vegetable"]}, {"id": "TACO_0162", "nome": "Vagem crua", "categoria": "Verduras e legumes", "medida": "1 porção", "porcaoG": 100, "kcal": 24.9, "carb": 5.35, "prot": 1.79, "gord": 0.17, "fibra": 2.38, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": ["non_starchy_vegetable"]}, {"id": "TACO_0163", "nome": "Abacate cru", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 96.15, "carb": 6.03, "prot": 1.24, "gord": 8.4, "fibra": 6.31, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0164", "nome": "Abacaxi cru", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 48.32, "carb": 12.33, "prot": 0.86, "gord": 0.12, "fibra": 0.99, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": ["fruit"]}, {"id": "TACO_0165", "nome": "Abacaxi polpa congelada", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 30.59, "carb": 7.8, "prot": 0.47, "gord": 0.11, "fibra": 0.33, "sodio": 1.24, "apto": true, "fonte": "TACO", "tags": ["fruit"]}, {"id": "TACO_0166", "nome": "Abiu cru", "categoria": "Frutas e derivados", "medida": "1 porção", "porcaoG": 100, "kcal": 62.42, "carb": 14.93, "prot": 0.83, "gord": 0.7, "fibra": 1.7, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0167", "nome": "Açaí polpa com xarope de guaraná e glucose", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 110.3, "carb": 21.46, "prot": 0.72, "gord": 3.66, "fibra": 1.72, "sodio": 15.1, "apto": true, "fonte": "TACO", "tags": ["fruit"]}, {"id": "TACO_0168", "nome": "Açaí polpa congelada", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 58.05, "carb": 6.21, "prot": 0.8, "gord": 3.94, "fibra": 2.55, "sodio": 5.18, "apto": true, "fonte": "TACO", "tags": ["fruit"]}, {"id": "TACO_0169", "nome": "Acerola crua", "categoria": "Frutas e derivados", "medida": "1 porção", "porcaoG": 100, "kcal": 33.46, "carb": 7.97, "prot": 0.91, "gord": 0.21, "fibra": 1.51, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0170", "nome": "Acerola polpa congelada", "categoria": "Frutas e derivados", "medida": "1 porção", "porcaoG": 100, "kcal": 21.94, "carb": 5.54, "prot": 0.59, "gord": 0.0, "fibra": 0.7, "sodio": 1.28, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0171", "nome": "Ameixa calda enlatada", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 182.85, "carb": 46.89, "prot": 0.41, "gord": 0.0, "fibra": 0.52, "sodio": 2.7, "apto": true, "fonte": "TACO", "tags": ["fruit"]}, {"id": "TACO_0172", "nome": "Ameixa crua", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 52.54, "carb": 13.85, "prot": 0.77, "gord": 0.0, "fibra": 2.43, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": ["fruit"]}, {"id": "TACO_0173", "nome": "Ameixa em calda enlatada drenada", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 177.36, "carb": 47.66, "prot": 1.02, "gord": 0.28, "fibra": 4.55, "sodio": 2.79, "apto": true, "fonte": "TACO", "tags": ["fruit"]}, {"id": "TACO_0174", "nome": "Atemóia crua", "categoria": "Frutas e derivados", "medida": "1 porção", "porcaoG": 100, "kcal": 96.97, "carb": 25.33, "prot": 0.97, "gord": 0.3, "fibra": 2.14, "sodio": 0.79, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0175", "nome": "Banana da terra crua", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 128.02, "carb": 33.67, "prot": 1.43, "gord": 0.24, "fibra": 1.53, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": ["fruit"]}, {"id": "TACO_0176", "nome": "Banana doce em barra", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 280.11, "carb": 75.67, "prot": 2.17, "gord": 0.05, "fibra": 3.83, "sodio": 9.88, "apto": true, "fonte": "TACO", "tags": ["fruit"]}, {"id": "TACO_0177", "nome": "Banana figo crua", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 105.08, "carb": 27.8, "prot": 1.13, "gord": 0.14, "fibra": 2.8, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": ["fruit"]}, {"id": "TACO_0178", "nome": "Banana maçã crua", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 86.81, "carb": 22.34, "prot": 1.75, "gord": 0.06, "fibra": 2.59, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": ["fruit"]}, {"id": "TACO_0179", "nome": "Banana nanica crua", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 91.53, "carb": 23.85, "prot": 1.4, "gord": 0.12, "fibra": 1.95, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": ["fruit"]}, {"id": "TACO_0180", "nome": "Banana ouro crua", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 112.37, "carb": 29.34, "prot": 1.48, "gord": 0.21, "fibra": 1.95, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": ["fruit"]}, {"id": "TACO_0181", "nome": "Banana pacova crua", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 77.91, "carb": 20.31, "prot": 1.23, "gord": 0.08, "fibra": 2.03, "sodio": 0.94, "apto": true, "fonte": "TACO", "tags": ["fruit"]}, {"id": "TACO_0182", "nome": "Banana prata crua", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 98.25, "carb": 25.96, "prot": 1.27, "gord": 0.07, "fibra": 2.04, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": ["fruit"]}, {"id": "TACO_0183", "nome": "Cacau cru", "categoria": "Frutas e derivados", "medida": "1 porção", "porcaoG": 100, "kcal": 74.29, "carb": 19.41, "prot": 0.95, "gord": 0.14, "fibra": 2.19, "sodio": 0.7, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0184", "nome": "Cajá-Manga cru", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 45.58, "carb": 11.43, "prot": 1.28, "gord": 0.0, "fibra": 2.58, "sodio": 1.44, "apto": true, "fonte": "TACO", "tags": ["fruit"]}, {"id": "TACO_0185", "nome": "Cajá polpa congelada", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 26.33, "carb": 6.37, "prot": 0.59, "gord": 0.17, "fibra": 1.36, "sodio": 6.95, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0186", "nome": "Caju cru", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 43.07, "carb": 10.29, "prot": 0.97, "gord": 0.33, "fibra": 1.68, "sodio": 2.97, "apto": true, "fonte": "TACO", "tags": ["fruit"]}, {"id": "TACO_0187", "nome": "Caju polpa congelada", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 36.57, "carb": 9.35, "prot": 0.48, "gord": 0.15, "fibra": 0.81, "sodio": 4.16, "apto": true, "fonte": "TACO", "tags": ["fruit"]}, {"id": "TACO_0188", "nome": "Caju suco concentrado envasado", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 45.11, "carb": 10.73, "prot": 0.4, "gord": 0.2, "fibra": 0.63, "sodio": 45.04, "apto": true, "fonte": "TACO", "tags": ["sugary_drink", "fruit"]}, {"id": "TACO_0189", "nome": "Caqui chocolate cru", "categoria": "Doces e sobremesas", "medida": "1 porção", "porcaoG": 100, "kcal": 71.35, "carb": 19.33, "prot": 0.36, "gord": 0.07, "fibra": 6.52, "sodio": 2.18, "apto": true, "fonte": "TACO", "tags": ["sweet"]}, {"id": "TACO_0190", "nome": "Carambola crua", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 45.74, "carb": 11.48, "prot": 0.87, "gord": 0.18, "fibra": 2.03, "sodio": 4.09, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0191", "nome": "Ciriguela crua", "categoria": "Outros", "medida": "1 porção", "porcaoG": 100, "kcal": 75.59, "carb": 18.86, "prot": 1.4, "gord": 0.36, "fibra": 3.9, "sodio": 1.68, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0192", "nome": "Cupuaçu cru", "categoria": "Outros", "medida": "1 porção", "porcaoG": 100, "kcal": 49.42, "carb": 10.43, "prot": 1.16, "gord": 0.95, "fibra": 3.12, "sodio": 3.2, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0193", "nome": "Cupuaçu polpa congelada", "categoria": "Outros", "medida": "1 porção", "porcaoG": 100, "kcal": 48.8, "carb": 11.39, "prot": 0.84, "gord": 0.59, "fibra": 1.59, "sodio": 0.69, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0194", "nome": "Figo cru", "categoria": "Outros", "medida": "1 porção", "porcaoG": 100, "kcal": 41.45, "carb": 10.25, "prot": 0.97, "gord": 0.16, "fibra": 1.79, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0195", "nome": "Figo enlatado em calda", "categoria": "Outros", "medida": "1 porção", "porcaoG": 100, "kcal": 184.36, "carb": 50.34, "prot": 0.56, "gord": 0.15, "fibra": 1.98, "sodio": 6.87, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0196", "nome": "Fruta-pão crua", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 67.05, "carb": 17.17, "prot": 1.08, "gord": 0.19, "fibra": 5.55, "sodio": 0.8, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0197", "nome": "Goiaba branca com casca crua", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 51.74, "carb": 12.4, "prot": 0.9, "gord": 0.49, "fibra": 6.33, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": ["fruit"]}, {"id": "TACO_0198", "nome": "Goiaba doce em pasta", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 268.96, "carb": 74.12, "prot": 0.58, "gord": 0.0, "fibra": 3.73, "sodio": 3.7, "apto": true, "fonte": "TACO", "tags": ["fruit"]}, {"id": "TACO_0199", "nome": "Goiaba doce cascão", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 285.59, "carb": 78.7, "prot": 0.41, "gord": 0.1, "fibra": 4.37, "sodio": 11.03, "apto": true, "fonte": "TACO", "tags": ["sweet", "fruit"]}, {"id": "TACO_0200", "nome": "Goiaba vermelha com casca crua", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 54.17, "carb": 13.01, "prot": 1.09, "gord": 0.44, "fibra": 6.22, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": ["fruit"]}, {"id": "TACO_0201", "nome": "Graviola crua", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 61.62, "carb": 15.84, "prot": 0.85, "gord": 0.21, "fibra": 1.91, "sodio": 4.16, "apto": true, "fonte": "TACO", "tags": ["fruit"]}, {"id": "TACO_0202", "nome": "Graviola polpa congelada", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 38.27, "carb": 9.78, "prot": 0.57, "gord": 0.14, "fibra": 1.19, "sodio": 3.05, "apto": true, "fonte": "TACO", "tags": ["fruit"]}, {"id": "TACO_0203", "nome": "Jabuticaba crua", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 58.05, "carb": 15.26, "prot": 0.61, "gord": 0.13, "fibra": 2.3, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": ["fruit"]}, {"id": "TACO_0204", "nome": "Jaca crua", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 87.92, "carb": 22.5, "prot": 1.4, "gord": 0.27, "fibra": 2.39, "sodio": 1.8, "apto": true, "fonte": "TACO", "tags": ["fruit"]}, {"id": "TACO_0205", "nome": "Jambo cru", "categoria": "Outros", "medida": "1 porção", "porcaoG": 100, "kcal": 26.91, "carb": 6.49, "prot": 0.89, "gord": 0.07, "fibra": 5.07, "sodio": 21.66, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0206", "nome": "Jamelão cru", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 41.01, "carb": 10.63, "prot": 0.55, "gord": 0.11, "fibra": 1.78, "sodio": 1.37, "apto": true, "fonte": "TACO", "tags": ["fruit"]}, {"id": "TACO_0207", "nome": "Kiwi cru", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 51.14, "carb": 11.5, "prot": 1.34, "gord": 0.63, "fibra": 2.65, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": ["fruit"]}, {"id": "TACO_0208", "nome": "Laranja baía crua", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 45.44, "carb": 11.47, "prot": 0.98, "gord": 0.1, "fibra": 1.12, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": ["fruit"]}, {"id": "TACO_0209", "nome": "Laranja baía suco", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 36.65, "carb": 8.7, "prot": 0.65, "gord": 0.0, "fibra": 0.0, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": ["sugary_drink", "fruit"]}, {"id": "TACO_0210", "nome": "Laranja da terra crua", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 51.47, "carb": 12.86, "prot": 1.08, "gord": 0.19, "fibra": 3.98, "sodio": 0.83, "apto": true, "fonte": "TACO", "tags": ["fruit"]}, {"id": "TACO_0211", "nome": "Laranja da terra suco", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 40.96, "carb": 9.57, "prot": 0.67, "gord": 0.14, "fibra": 1.03, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": ["sugary_drink", "fruit"]}, {"id": "TACO_0212", "nome": "Laranja lima crua", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 45.7, "carb": 11.53, "prot": 1.06, "gord": 0.08, "fibra": 1.78, "sodio": 1.11, "apto": true, "fonte": "TACO", "tags": ["fruit"]}, {"id": "TACO_0213", "nome": "Laranja lima suco", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 39.34, "carb": 9.17, "prot": 0.71, "gord": 0.12, "fibra": 0.42, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": ["sugary_drink", "fruit"]}, {"id": "TACO_0214", "nome": "Laranja pêra crua", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 36.77, "carb": 8.95, "prot": 1.04, "gord": 0.13, "fibra": 0.77, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": ["fruit"]}, {"id": "TACO_0215", "nome": "Laranja pêra suco", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 32.71, "carb": 7.55, "prot": 0.74, "gord": 0.07, "fibra": 0.0, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": ["sugary_drink", "fruit"]}, {"id": "TACO_0216", "nome": "Laranja valência crua", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 46.11, "carb": 11.72, "prot": 0.77, "gord": 0.16, "fibra": 1.73, "sodio": 0.63, "apto": true, "fonte": "TACO", "tags": ["fruit"]}, {"id": "TACO_0217", "nome": "Laranja valência suco", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 36.2, "carb": 8.55, "prot": 0.48, "gord": 0.12, "fibra": 0.42, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": ["sugary_drink", "fruit"]}, {"id": "TACO_0218", "nome": "Limão cravo suco", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 14.1, "carb": 5.25, "prot": 0.33, "gord": 0.0, "fibra": 0.0, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": ["sugary_drink", "fruit"]}, {"id": "TACO_0219", "nome": "Limão galego suco", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 22.23, "carb": 7.32, "prot": 0.57, "gord": 0.07, "fibra": 0.0, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": ["sugary_drink", "fruit"]}, {"id": "TACO_0220", "nome": "Limão tahiti cru", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 31.82, "carb": 11.08, "prot": 0.94, "gord": 0.14, "fibra": 1.18, "sodio": 1.25, "apto": true, "fonte": "TACO", "tags": ["fruit"]}, {"id": "TACO_0221", "nome": "Maçã Argentina com casca crua", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 62.53, "carb": 16.59, "prot": 0.23, "gord": 0.25, "fibra": 2.03, "sodio": 1.32, "apto": true, "fonte": "TACO", "tags": ["fruit"]}, {"id": "TACO_0222", "nome": "Maçã Fuji com casca crua", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 55.52, "carb": 15.15, "prot": 0.29, "gord": 0.0, "fibra": 1.35, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": ["fruit"]}, {"id": "TACO_0223", "nome": "Macaúba crua", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 404.28, "carb": 13.95, "prot": 2.08, "gord": 40.66, "fibra": 13.44, "sodio": 0.65, "apto": true, "fonte": "TACO", "tags": ["fruit"]}, {"id": "TACO_0224", "nome": "Mamão doce em calda drenado", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 195.63, "carb": 54.0, "prot": 0.19, "gord": 0.07, "fibra": 1.31, "sodio": 2.91, "apto": true, "fonte": "TACO", "tags": ["fruit"]}, {"id": "TACO_0225", "nome": "Mamão Formosa cru", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 45.34, "carb": 11.55, "prot": 0.82, "gord": 0.12, "fibra": 1.81, "sodio": 3.26, "apto": true, "fonte": "TACO", "tags": ["fruit"]}, {"id": "TACO_0226", "nome": "Mamão Papaia cru", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 40.16, "carb": 10.44, "prot": 0.46, "gord": 0.12, "fibra": 1.04, "sodio": 1.63, "apto": true, "fonte": "TACO", "tags": ["fruit"]}, {"id": "TACO_0227", "nome": "Mamão verde doce em calda drenado", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 209.38, "carb": 57.64, "prot": 0.32, "gord": 0.1, "fibra": 1.23, "sodio": 4.74, "apto": true, "fonte": "TACO", "tags": ["fruit"]}, {"id": "TACO_0228", "nome": "Manga Haden crua", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 63.5, "carb": 16.66, "prot": 0.41, "gord": 0.26, "fibra": 1.58, "sodio": 0.55, "apto": true, "fonte": "TACO", "tags": ["fruit"]}, {"id": "TACO_0229", "nome": "Manga Palmer crua", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 72.49, "carb": 19.35, "prot": 0.41, "gord": 0.17, "fibra": 1.63, "sodio": 1.86, "apto": true, "fonte": "TACO", "tags": ["fruit"]}, {"id": "TACO_0230", "nome": "Manga polpa congelada", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 48.31, "carb": 12.52, "prot": 0.38, "gord": 0.23, "fibra": 1.07, "sodio": 6.73, "apto": true, "fonte": "TACO", "tags": ["fruit"]}, {"id": "TACO_0231", "nome": "Manga Tommy Atkins crua", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 50.69, "carb": 12.77, "prot": 0.86, "gord": 0.22, "fibra": 2.07, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": ["fruit"]}, {"id": "TACO_0232", "nome": "Maracujá cru", "categoria": "Outros", "medida": "1 porção", "porcaoG": 100, "kcal": 68.44, "carb": 12.26, "prot": 1.99, "gord": 2.1, "fibra": 1.14, "sodio": 1.58, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0233", "nome": "Maracujá polpa congelada", "categoria": "Outros", "medida": "1 porção", "porcaoG": 100, "kcal": 38.76, "carb": 9.6, "prot": 0.81, "gord": 0.18, "fibra": 0.51, "sodio": 8.1, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0234", "nome": "Maracujá suco concentrado envasado", "categoria": "Bebidas", "medida": "1 copo", "porcaoG": 100, "kcal": 41.97, "carb": 9.64, "prot": 0.77, "gord": 0.19, "fibra": 0.35, "sodio": 21.69, "apto": true, "fonte": "TACO", "tags": ["sugary_drink"]}, {"id": "TACO_0235", "nome": "Melancia crua", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 32.61, "carb": 8.14, "prot": 0.88, "gord": 0.0, "fibra": 0.12, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": ["fruit"]}, {"id": "TACO_0236", "nome": "Melão cru", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 29.37, "carb": 7.53, "prot": 0.68, "gord": 0.0, "fibra": 0.25, "sodio": 11.17, "apto": true, "fonte": "TACO", "tags": ["fruit"]}, {"id": "TACO_0237", "nome": "Mexerica Murcote crua", "categoria": "Outros", "medida": "1 porção", "porcaoG": 100, "kcal": 57.59, "carb": 14.86, "prot": 0.88, "gord": 0.13, "fibra": 3.07, "sodio": 1.17, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0238", "nome": "Mexerica Rio crua", "categoria": "Outros", "medida": "1 porção", "porcaoG": 100, "kcal": 36.87, "carb": 9.34, "prot": 0.65, "gord": 0.13, "fibra": 2.73, "sodio": 1.82, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0239", "nome": "Morango cru", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 30.15, "carb": 6.82, "prot": 0.89, "gord": 0.31, "fibra": 1.72, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": ["fruit"]}, {"id": "TACO_0240", "nome": "Nêspera crua", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 42.54, "carb": 11.53, "prot": 0.31, "gord": 0.0, "fibra": 2.96, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": ["fruit"]}, {"id": "TACO_0241", "nome": "Pequi cru", "categoria": "Outros", "medida": "1 porção", "porcaoG": 100, "kcal": 204.97, "carb": 12.97, "prot": 2.34, "gord": 17.97, "fibra": 19.04, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0242", "nome": "Pêra Park crua", "categoria": "Outros", "medida": "1 porção", "porcaoG": 100, "kcal": 60.59, "carb": 16.07, "prot": 0.24, "gord": 0.23, "fibra": 2.98, "sodio": 0.98, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0243", "nome": "Pêra Williams crua", "categoria": "Outros", "medida": "1 porção", "porcaoG": 100, "kcal": 53.31, "carb": 14.02, "prot": 0.57, "gord": 0.11, "fibra": 3.01, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0244", "nome": "Pêssego Aurora cru", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 36.33, "carb": 9.32, "prot": 0.82, "gord": 0.0, "fibra": 1.42, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": ["fruit"]}, {"id": "TACO_0245", "nome": "Pêssego enlatado em calda", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 63.14, "carb": 16.88, "prot": 0.71, "gord": 0.0, "fibra": 1.02, "sodio": 3.2, "apto": true, "fonte": "TACO", "tags": ["fruit"]}, {"id": "TACO_0246", "nome": "Pinha crua", "categoria": "Outros", "medida": "1 porção", "porcaoG": 100, "kcal": 88.47, "carb": 22.45, "prot": 1.49, "gord": 0.32, "fibra": 3.36, "sodio": 1.34, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0247", "nome": "Pitanga crua", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 41.42, "carb": 10.24, "prot": 0.93, "gord": 0.17, "fibra": 3.24, "sodio": 1.7, "apto": true, "fonte": "TACO", "tags": ["fruit"]}, {"id": "TACO_0248", "nome": "Pitanga polpa congelada", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 19.11, "carb": 4.76, "prot": 0.29, "gord": 0.12, "fibra": 0.74, "sodio": 5.03, "apto": true, "fonte": "TACO", "tags": ["fruit"]}, {"id": "TACO_0249", "nome": "Romã crua", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 55.74, "carb": 15.11, "prot": 0.4, "gord": 0.0, "fibra": 0.44, "sodio": 0.59, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0250", "nome": "Tamarindo cru", "categoria": "Outros", "medida": "1 porção", "porcaoG": 100, "kcal": 275.7, "carb": 72.53, "prot": 3.21, "gord": 0.46, "fibra": 6.45, "sodio": 0.36, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0251", "nome": "Tangerina Poncã crua", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 37.83, "carb": 9.61, "prot": 0.85, "gord": 0.07, "fibra": 0.94, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": ["fruit"]}, {"id": "TACO_0252", "nome": "Tangerina Poncã suco", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 36.11, "carb": 8.8, "prot": 0.52, "gord": 0.0, "fibra": 0.0, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": ["sugary_drink", "fruit"]}, {"id": "TACO_0253", "nome": "Tucumã cru", "categoria": "Outros", "medida": "1 porção", "porcaoG": 100, "kcal": 262.02, "carb": 26.47, "prot": 2.09, "gord": 19.08, "fibra": 12.65, "sodio": 3.89, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0254", "nome": "Umbu cru", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 37.02, "carb": 9.4, "prot": 0.84, "gord": 0.0, "fibra": 1.98, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0255", "nome": "Umbu polpa congelada", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 33.94, "carb": 8.79, "prot": 0.51, "gord": 0.07, "fibra": 1.34, "sodio": 5.77, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0256", "nome": "Uva Itália crua", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 52.87, "carb": 13.57, "prot": 0.75, "gord": 0.2, "fibra": 0.92, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": ["fruit"]}, {"id": "TACO_0257", "nome": "Uva Rubi crua", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 49.06, "carb": 12.7, "prot": 0.61, "gord": 0.16, "fibra": 0.93, "sodio": 7.92, "apto": true, "fonte": "TACO", "tags": ["fruit"]}, {"id": "TACO_0258", "nome": "Uva suco concentrado envasado", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 57.66, "carb": 14.71, "prot": 0.0, "gord": 0.0, "fibra": 0.23, "sodio": 9.58, "apto": true, "fonte": "TACO", "tags": ["sugary_drink", "fruit"]}, {"id": "TACO_0259", "nome": "Azeite de dendê", "categoria": "Óleos e gorduras", "medida": "1 colher de chá", "porcaoG": 100, "kcal": 884.0, "carb": 0.0, "prot": 0.0, "gord": 100.0, "fibra": 0.0, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0260", "nome": "Azeite de oliva extra virgem", "categoria": "Óleos e gorduras", "medida": "1 colher de chá", "porcaoG": 100, "kcal": 884.0, "carb": 0.0, "prot": 0.0, "gord": 100.0, "fibra": 0.0, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0261", "nome": "Manteiga com sal", "categoria": "Laticínios", "medida": "1 porção", "porcaoG": 100, "kcal": 725.97, "carb": 0.06, "prot": 0.41, "gord": 82.36, "fibra": 0.0, "sodio": 578.69, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0262", "nome": "Manteiga sem sal", "categoria": "Laticínios", "medida": "1 porção", "porcaoG": 100, "kcal": 757.54, "carb": 0.0, "prot": 0.4, "gord": 86.04, "fibra": 0.0, "sodio": 3.85, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0263", "nome": "Margarina com óleo hidrogenado com sal (65% de lipídeos)", "categoria": "Óleos e gorduras", "medida": "1 colher de chá", "porcaoG": 100, "kcal": 596.12, "carb": 0.0, "prot": 0.0, "gord": 67.43, "fibra": 0.0, "sodio": 894.04, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0264", "nome": "Margarina com óleo hidrogenado sem sal (80% de lipídeos)", "categoria": "Óleos e gorduras", "medida": "1 colher de chá", "porcaoG": 100, "kcal": 722.53, "carb": 0.0, "prot": 0.0, "gord": 81.73, "fibra": 0.0, "sodio": 77.89, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0265", "nome": "Margarina com óleo interesterificado com sal (65%de lipídeos)", "categoria": "Óleos e gorduras", "medida": "1 colher de chá", "porcaoG": 100, "kcal": 594.45, "carb": 0.0, "prot": 0.0, "gord": 67.25, "fibra": 0.0, "sodio": 560.8, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0266", "nome": "Margarina com óleo interesterificado sem sal (65% de lipídeos)", "categoria": "Óleos e gorduras", "medida": "1 colher de chá", "porcaoG": 100, "kcal": 593.14, "carb": 0.0, "prot": 0.0, "gord": 67.1, "fibra": 0.0, "sodio": 33.19, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0267", "nome": "Óleo de babaçu", "categoria": "Óleos e gorduras", "medida": "1 colher de chá", "porcaoG": 100, "kcal": 884.0, "carb": 0.0, "prot": 0.0, "gord": 100.0, "fibra": 0.0, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0268", "nome": "Óleo de canola", "categoria": "Óleos e gorduras", "medida": "1 colher de chá", "porcaoG": 100, "kcal": 884.0, "carb": 0.0, "prot": 0.0, "gord": 100.0, "fibra": 0.0, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0269", "nome": "Óleo de girassol", "categoria": "Óleos e gorduras", "medida": "1 colher de chá", "porcaoG": 100, "kcal": 884.0, "carb": 0.0, "prot": 0.0, "gord": 100.0, "fibra": 0.0, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0270", "nome": "Óleo de milho", "categoria": "Cereais", "medida": "4 colheres de sopa", "porcaoG": 100, "kcal": 884.0, "carb": 0.0, "prot": 0.0, "gord": 100.0, "fibra": 0.0, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": ["starchy_vegetable"]}, {"id": "TACO_0271", "nome": "Óleo de pequi", "categoria": "Óleos e gorduras", "medida": "1 colher de chá", "porcaoG": 100, "kcal": 884.0, "carb": 0.0, "prot": 0.0, "gord": 100.0, "fibra": 0.0, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0272", "nome": "Óleo de soja", "categoria": "Leguminosas", "medida": "1 concha", "porcaoG": 100, "kcal": 884.0, "carb": 0.0, "prot": 0.0, "gord": 100.0, "fibra": 0.0, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": ["legume"]}, {"id": "TACO_0273", "nome": "Abadejo filé congelado assado", "categoria": "Pescados e frutos do mar", "medida": "1 porção", "porcaoG": 100, "kcal": 111.62, "carb": 0.0, "prot": 23.52, "gord": 1.24, "fibra": 0.0, "sodio": 334.39, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0274", "nome": "Abadejo filé congelado cozido", "categoria": "Pescados e frutos do mar", "medida": "1 porção", "porcaoG": 100, "kcal": 91.1, "carb": 0.0, "prot": 19.35, "gord": 0.94, "fibra": 0.0, "sodio": 189.34, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0275", "nome": "Abadejo filé congelado cru", "categoria": "Pescados e frutos do mar", "medida": "1 porção", "porcaoG": 100, "kcal": 59.11, "carb": 0.0, "prot": 13.08, "gord": 0.36, "fibra": 0.0, "sodio": 78.52, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0276", "nome": "Abadejo filé congelado grelhado", "categoria": "Pescados e frutos do mar", "medida": "1 porção", "porcaoG": 100, "kcal": 129.64, "carb": 0.0, "prot": 27.61, "gord": 1.3, "fibra": 0.0, "sodio": 305.09, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0277", "nome": "Atum conserva em óleo", "categoria": "Peixes e frutos do mar", "medida": "1 filé", "porcaoG": 100, "kcal": 165.91, "carb": 0.0, "prot": 26.19, "gord": 6.0, "fibra": 0.0, "sodio": 362.15, "apto": true, "fonte": "TACO", "tags": ["lean_protein"]}, {"id": "TACO_0278", "nome": "Atum fresco cru", "categoria": "Peixes e frutos do mar", "medida": "1 filé", "porcaoG": 100, "kcal": 117.5, "carb": 0.0, "prot": 25.68, "gord": 0.87, "fibra": 0.0, "sodio": 30.3, "apto": true, "fonte": "TACO", "tags": ["lean_protein"]}, {"id": "TACO_0279", "nome": "Bacalhau salgado cru", "categoria": "Peixes e frutos do mar", "medida": "1 filé", "porcaoG": 100, "kcal": 135.89, "carb": 0.0, "prot": 29.04, "gord": 1.32, "fibra": 0.0, "sodio": 13585.06, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0281", "nome": "Cação posta com farinha de trigo frita", "categoria": "Cereais", "medida": "4 colheres de sopa", "porcaoG": 100, "kcal": 208.33, "carb": 3.1, "prot": 24.95, "gord": 9.95, "fibra": 0.54, "sodio": 160.03, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0282", "nome": "Cação posta cozida", "categoria": "Outros", "medida": "1 porção", "porcaoG": 100, "kcal": 116.01, "carb": 0.0, "prot": 25.59, "gord": 0.75, "fibra": 0.0, "sodio": 114.91, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0283", "nome": "Cação posta crua", "categoria": "Outros", "medida": "1 porção", "porcaoG": 100, "kcal": 83.33, "carb": 0.0, "prot": 17.85, "gord": 0.79, "fibra": 0.0, "sodio": 176.02, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0284", "nome": "Camarão Rio Grande grande cozido", "categoria": "Peixes e frutos do mar", "medida": "1 filé", "porcaoG": 100, "kcal": 90.01, "carb": 0.0, "prot": 18.97, "gord": 1.0, "fibra": 0.0, "sodio": 366.55, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0285", "nome": "Camarão Rio Grande grande cru", "categoria": "Peixes e frutos do mar", "medida": "1 filé", "porcaoG": 100, "kcal": 47.18, "carb": 0.0, "prot": 9.99, "gord": 0.5, "fibra": 0.0, "sodio": 201.13, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0286", "nome": "Camarão Sete Barbas sem cabeça com casca frito", "categoria": "Peixes e frutos do mar", "medida": "1 filé", "porcaoG": 100, "kcal": 231.25, "carb": 2.88, "prot": 18.39, "gord": 15.62, "fibra": 0.0, "sodio": 99.06, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0287", "nome": "Caranguejo cozido", "categoria": "Peixes e frutos do mar", "medida": "1 filé", "porcaoG": 100, "kcal": 82.72, "carb": 0.0, "prot": 18.48, "gord": 0.42, "fibra": 0.0, "sodio": 360.11, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0288", "nome": "Corimba cru", "categoria": "Outros", "medida": "1 porção", "porcaoG": 100, "kcal": 128.16, "carb": 0.0, "prot": 17.37, "gord": 5.99, "fibra": 0.0, "sodio": 47.01, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0289", "nome": "Corimbatá assado", "categoria": "Outros", "medida": "1 porção", "porcaoG": 100, "kcal": 261.45, "carb": 0.0, "prot": 19.9, "gord": 19.57, "fibra": 0.0, "sodio": 40.43, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0290", "nome": "Corimbatá cozido", "categoria": "Outros", "medida": "1 porção", "porcaoG": 100, "kcal": 238.7, "carb": 0.0, "prot": 20.13, "gord": 16.93, "fibra": 0.0, "sodio": 37.17, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0291", "nome": "Corvina de água doce crua", "categoria": "Peixes e frutos do mar", "medida": "1 filé", "porcaoG": 100, "kcal": 101.01, "carb": 0.0, "prot": 18.92, "gord": 2.24, "fibra": 0.0, "sodio": 45.09, "apto": true, "fonte": "TACO", "tags": ["sweet"]}, {"id": "TACO_0292", "nome": "Corvina do mar crua", "categoria": "Peixes e frutos do mar", "medida": "1 filé", "porcaoG": 100, "kcal": 94.0, "carb": 0.0, "prot": 18.57, "gord": 1.58, "fibra": 0.0, "sodio": 67.97, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0293", "nome": "Corvina grande assada", "categoria": "Peixes e frutos do mar", "medida": "1 filé", "porcaoG": 100, "kcal": 146.53, "carb": 0.0, "prot": 26.77, "gord": 3.57, "fibra": 0.0, "sodio": 85.35, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0294", "nome": "Corvina grande cozida", "categoria": "Peixes e frutos do mar", "medida": "1 filé", "porcaoG": 100, "kcal": 100.08, "carb": 0.0, "prot": 23.44, "gord": 2.56, "fibra": 0.0, "sodio": 68.39, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0295", "nome": "Dourada de água doce fresca", "categoria": "Peixes e frutos do mar", "medida": "1 filé", "porcaoG": 100, "kcal": 131.21, "carb": 0.0, "prot": 18.81, "gord": 5.64, "fibra": 0.0, "sodio": 40.3, "apto": true, "fonte": "TACO", "tags": ["sweet"]}, {"id": "TACO_0296", "nome": "Lambari congelado cru", "categoria": "Outros", "medida": "1 porção", "porcaoG": 100, "kcal": 130.84, "carb": 0.0, "prot": 16.81, "gord": 6.55, "fibra": 0.0, "sodio": 47.92, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0297", "nome": "Lambari congelado frito", "categoria": "Outros", "medida": "1 porção", "porcaoG": 100, "kcal": 326.87, "carb": 0.0, "prot": 28.43, "gord": 22.78, "fibra": 0.0, "sodio": 64.55, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0298", "nome": "Lambari fresco cru", "categoria": "Outros", "medida": "1 porção", "porcaoG": 100, "kcal": 151.6, "carb": 0.0, "prot": 15.65, "gord": 9.4, "fibra": 0.0, "sodio": 41.11, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0299", "nome": "Manjuba com farinha de trigo frita", "categoria": "Cereais", "medida": "4 colheres de sopa", "porcaoG": 100, "kcal": 343.55, "carb": 10.24, "prot": 23.45, "gord": 22.59, "fibra": 0.36, "sodio": 36.52, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0300", "nome": "Manjuba frita", "categoria": "Outros", "medida": "1 porção", "porcaoG": 100, "kcal": 349.33, "carb": 0.0, "prot": 30.14, "gord": 24.46, "fibra": 0.0, "sodio": 40.61, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0301", "nome": "Merluza filé assado", "categoria": "Peixes e frutos do mar", "medida": "1 filé", "porcaoG": 100, "kcal": 121.91, "carb": 0.0, "prot": 26.6, "gord": 0.92, "fibra": 0.0, "sodio": 119.95, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0302", "nome": "Merluza filé cru", "categoria": "Peixes e frutos do mar", "medida": "1 filé", "porcaoG": 100, "kcal": 89.13, "carb": 0.0, "prot": 16.61, "gord": 2.02, "fibra": 0.0, "sodio": 79.5, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0303", "nome": "Merluza filé frito", "categoria": "Peixes e frutos do mar", "medida": "1 filé", "porcaoG": 100, "kcal": 191.63, "carb": 0.0, "prot": 26.93, "gord": 8.5, "fibra": 0.0, "sodio": 89.96, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0304", "nome": "Pescada branca crua", "categoria": "Peixes e frutos do mar", "medida": "1 filé", "porcaoG": 100, "kcal": 110.88, "carb": 0.0, "prot": 16.26, "gord": 4.59, "fibra": 0.0, "sodio": 76.17, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0305", "nome": "Pescada branca frita", "categoria": "Peixes e frutos do mar", "medida": "1 filé", "porcaoG": 100, "kcal": 223.04, "carb": 0.0, "prot": 27.36, "gord": 11.78, "fibra": 0.0, "sodio": 107.23, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0306", "nome": "Pescada filé com farinha de trigo frito", "categoria": "Cereais", "medida": "4 colheres de sopa", "porcaoG": 100, "kcal": 283.43, "carb": 5.03, "prot": 21.44, "gord": 19.11, "fibra": 0.0, "sodio": 90.51, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0307", "nome": "Pescada filé cru", "categoria": "Peixes e frutos do mar", "medida": "1 filé", "porcaoG": 100, "kcal": 107.21, "carb": 0.0, "prot": 16.65, "gord": 4.0, "fibra": 0.0, "sodio": 77.5, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0308", "nome": "Pescada filé frito", "categoria": "Peixes e frutos do mar", "medida": "1 filé", "porcaoG": 100, "kcal": 154.27, "carb": 0.0, "prot": 28.59, "gord": 3.57, "fibra": 0.0, "sodio": 114.91, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0309", "nome": "Pescada filé molho escabeche", "categoria": "Peixes e frutos do mar", "medida": "1 filé", "porcaoG": 100, "kcal": 141.96, "carb": 5.02, "prot": 11.75, "gord": 8.02, "fibra": 0.78, "sodio": 51.29, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0310", "nome": "Pescadinha crua", "categoria": "Outros", "medida": "1 porção", "porcaoG": 100, "kcal": 76.41, "carb": 0.0, "prot": 15.48, "gord": 1.14, "fibra": 0.0, "sodio": 120.34, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0311", "nome": "Pintado assado", "categoria": "Outros", "medida": "1 porção", "porcaoG": 100, "kcal": 191.56, "carb": 0.0, "prot": 36.45, "gord": 3.98, "fibra": 0.0, "sodio": 80.95, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0312", "nome": "Pintado cru", "categoria": "Outros", "medida": "1 porção", "porcaoG": 100, "kcal": 91.08, "carb": 0.0, "prot": 18.56, "gord": 1.31, "fibra": 0.0, "sodio": 43.34, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0313", "nome": "Pintado grelhado", "categoria": "Outros", "medida": "1 porção", "porcaoG": 100, "kcal": 152.19, "carb": 0.0, "prot": 30.8, "gord": 2.29, "fibra": 0.0, "sodio": 53.09, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0314", "nome": "Porquinho cru", "categoria": "Outros", "medida": "1 porção", "porcaoG": 100, "kcal": 93.02, "carb": 0.0, "prot": 20.49, "gord": 0.61, "fibra": 0.0, "sodio": 66.73, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0315", "nome": "Salmão filé com pele fresco grelhado", "categoria": "Peixes e frutos do mar", "medida": "1 filé", "porcaoG": 100, "kcal": 228.73, "carb": 0.0, "prot": 23.92, "gord": 14.04, "fibra": 0.0, "sodio": 85.14, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0316", "nome": "Salmão sem pele fresco cru", "categoria": "Peixes e frutos do mar", "medida": "1 filé", "porcaoG": 100, "kcal": 169.78, "carb": 0.0, "prot": 19.25, "gord": 9.71, "fibra": 0.0, "sodio": 64.24, "apto": true, "fonte": "TACO", "tags": ["lean_protein"]}, {"id": "TACO_0317", "nome": "Salmão sem pele fresco grelhado", "categoria": "Peixes e frutos do mar", "medida": "1 filé", "porcaoG": 100, "kcal": 242.71, "carb": 0.0, "prot": 26.14, "gord": 14.53, "fibra": 0.0, "sodio": 95.81, "apto": true, "fonte": "TACO", "tags": ["lean_protein"]}, {"id": "TACO_0318", "nome": "Sardinha assada", "categoria": "Peixes e frutos do mar", "medida": "1 filé", "porcaoG": 100, "kcal": 164.35, "carb": 0.0, "prot": 32.18, "gord": 2.99, "fibra": 0.0, "sodio": 74.47, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0319", "nome": "Sardinha conserva em óleo", "categoria": "Peixes e frutos do mar", "medida": "1 filé", "porcaoG": 100, "kcal": 284.98, "carb": 0.0, "prot": 15.94, "gord": 24.05, "fibra": 0.0, "sodio": 665.84, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0320", "nome": "Sardinha frita", "categoria": "Peixes e frutos do mar", "medida": "1 filé", "porcaoG": 100, "kcal": 257.04, "carb": 0.0, "prot": 33.38, "gord": 12.69, "fibra": 0.0, "sodio": 60.1, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0321", "nome": "Sardinha inteira crua", "categoria": "Peixes e frutos do mar", "medida": "1 filé", "porcaoG": 100, "kcal": 113.9, "carb": 0.0, "prot": 21.08, "gord": 2.65, "fibra": 0.0, "sodio": 60.39, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0322", "nome": "Tucunaré filé congelado cru", "categoria": "Outros", "medida": "1 porção", "porcaoG": 100, "kcal": 87.69, "carb": 0.0, "prot": 17.96, "gord": 1.22, "fibra": 0.0, "sodio": 56.55, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0323", "nome": "Apresuntado", "categoria": "Carnes e derivados", "medida": "1 porção", "porcaoG": 100, "kcal": 128.86, "carb": 2.86, "prot": 13.45, "gord": 6.69, "fibra": 0.0, "sodio": 942.93, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0324", "nome": "Caldo de carne tablete", "categoria": "Carnes e derivados", "medida": "1 porção", "porcaoG": 100, "kcal": 240.62, "carb": 15.05, "prot": 7.82, "gord": 16.57, "fibra": 0.58, "sodio": 22179.67, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0325", "nome": "Caldo de galinha tablete", "categoria": "Aves", "medida": "1 porção", "porcaoG": 100, "kcal": 251.45, "carb": 10.65, "prot": 6.28, "gord": 20.42, "fibra": 11.81, "sodio": 22299.9, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0326", "nome": "Carne bovina acém moído cozido", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 212.42, "carb": 0.0, "prot": 26.69, "gord": 10.92, "fibra": 0.0, "sodio": 52.36, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0327", "nome": "Carne bovina acém moído cru", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 136.56, "carb": 0.0, "prot": 19.42, "gord": 5.95, "fibra": 0.0, "sodio": 48.61, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0328", "nome": "Carne bovina acém sem gordura cozido", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 214.61, "carb": 0.0, "prot": 27.27, "gord": 10.88, "fibra": 0.0, "sodio": 56.17, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0329", "nome": "Carne bovina acém sem gordura cru", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 144.03, "carb": 0.0, "prot": 20.82, "gord": 6.11, "fibra": 0.0, "sodio": 49.85, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0332", "nome": "Carne bovina bucho cozido", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 133.02, "carb": 0.0, "prot": 21.64, "gord": 4.5, "fibra": 0.0, "sodio": 38.2, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0333", "nome": "Carne bovina bucho cru", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 137.3, "carb": 0.0, "prot": 20.53, "gord": 5.5, "fibra": 0.0, "sodio": 45.0, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0334", "nome": "Carne bovina capa de contra-filé com gordura crua", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 216.91, "carb": 0.0, "prot": 19.2, "gord": 14.96, "fibra": 0.0, "sodio": 57.54, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0335", "nome": "Carne bovina capa de contra-filé com gordura grelhada", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 311.7, "carb": 0.0, "prot": 30.69, "gord": 20.03, "fibra": 0.0, "sodio": 80.51, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0336", "nome": "Carne bovina capa de contra-filé sem gordura crua", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 131.06, "carb": 0.0, "prot": 21.54, "gord": 4.33, "fibra": 0.0, "sodio": 79.17, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0337", "nome": "Carne bovina capa de contra-filé sem gordura grelhada", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 239.44, "carb": 0.0, "prot": 35.06, "gord": 9.95, "fibra": 0.0, "sodio": 82.75, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0338", "nome": "Carne bovina charque cozido", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 262.78, "carb": 0.0, "prot": 36.36, "gord": 11.92, "fibra": 0.0, "sodio": 1442.7, "apto": true, "fonte": "TACO", "tags": ["processed_meat"]}, {"id": "TACO_0339", "nome": "Carne bovina charque cru", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 248.86, "carb": 0.0, "prot": 22.71, "gord": 16.84, "fibra": 0.0, "sodio": 5875.03, "apto": true, "fonte": "TACO", "tags": ["processed_meat"]}, {"id": "TACO_0340", "nome": "Carne bovina contra-filé à milanesa", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 351.59, "carb": 12.17, "prot": 20.61, "gord": 24.0, "fibra": 0.37, "sodio": 77.09, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0341", "nome": "Carne bovina contra-filé de costela cru", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 202.44, "carb": 0.0, "prot": 19.8, "gord": 13.07, "fibra": 0.0, "sodio": 38.52, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0342", "nome": "Carne bovina contra-filé de costela grelhado", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 274.91, "carb": 0.0, "prot": 29.88, "gord": 16.33, "fibra": 0.0, "sodio": 50.88, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0343", "nome": "Carne bovina contra-filé com gordura cru", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 205.86, "carb": 0.0, "prot": 21.15, "gord": 12.81, "fibra": 0.0, "sodio": 44.13, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0344", "nome": "Carne bovina contra-filé com gordura grelhado", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 278.05, "carb": 0.0, "prot": 32.4, "gord": 15.49, "fibra": 0.0, "sodio": 57.07, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0345", "nome": "Carne bovina contra-filé sem gordura cru", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 156.62, "carb": 0.0, "prot": 24.0, "gord": 6.0, "fibra": 0.0, "sodio": 52.89, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0346", "nome": "Carne bovina contra-filé sem gordura grelhado", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 193.69, "carb": 0.0, "prot": 35.88, "gord": 4.49, "fibra": 0.0, "sodio": 57.51, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0347", "nome": "Carne bovina costela assada", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 373.04, "carb": 0.0, "prot": 28.81, "gord": 27.72, "fibra": 0.0, "sodio": 91.86, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0348", "nome": "Carne bovina costela crua", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 357.72, "carb": 0.0, "prot": 16.71, "gord": 31.75, "fibra": 0.0, "sodio": 70.0, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0349", "nome": "Carne bovina coxão duro sem gordura cozido", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 216.62, "carb": 0.0, "prot": 31.88, "gord": 8.92, "fibra": 0.0, "sodio": 41.1, "apto": true, "fonte": "TACO", "tags": ["lean_protein"]}, {"id": "TACO_0350", "nome": "Carne bovina coxão duro sem gordura cru", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 147.97, "carb": 0.0, "prot": 21.51, "gord": 6.22, "fibra": 0.0, "sodio": 48.55, "apto": true, "fonte": "TACO", "tags": ["lean_protein"]}, {"id": "TACO_0351", "nome": "Carne bovina coxão mole sem gordura cozido", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 218.68, "carb": 0.0, "prot": 32.38, "gord": 8.91, "fibra": 0.0, "sodio": 43.5, "apto": true, "fonte": "TACO", "tags": ["lean_protein"]}, {"id": "TACO_0352", "nome": "Carne bovina coxão mole sem gordura cru", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 169.07, "carb": 0.0, "prot": 21.23, "gord": 8.69, "fibra": 0.0, "sodio": 60.53, "apto": true, "fonte": "TACO", "tags": ["lean_protein"]}, {"id": "TACO_0353", "nome": "Carne bovina cupim assado", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 330.1, "carb": 0.0, "prot": 28.63, "gord": 23.04, "fibra": 0.0, "sodio": 71.59, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0354", "nome": "Carne bovina cupim cru", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 221.4, "carb": 0.0, "prot": 19.54, "gord": 15.3, "fibra": 0.0, "sodio": 46.86, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0355", "nome": "Carne bovina fígado cru", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 141.05, "carb": 1.11, "prot": 20.71, "gord": 5.36, "fibra": 0.0, "sodio": 75.92, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0356", "nome": "Carne bovina fígado grelhado", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 225.03, "carb": 4.2, "prot": 29.86, "gord": 9.01, "fibra": 0.0, "sodio": 82.19, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0357", "nome": "Carne bovina filé mingnon sem gordura cru", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 142.86, "carb": 0.0, "prot": 21.6, "gord": 5.61, "fibra": 0.0, "sodio": 48.86, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0358", "nome": "Carne bovina filé mingnon sem gordura grelhado", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 219.7, "carb": 0.0, "prot": 32.8, "gord": 8.83, "fibra": 0.0, "sodio": 57.91, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0359", "nome": "Carne bovina flanco sem gordura cozido", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 195.58, "carb": 0.0, "prot": 29.38, "gord": 7.77, "fibra": 0.0, "sodio": 41.68, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0360", "nome": "Carne bovina flanco sem gordura cru", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 141.46, "carb": 0.0, "prot": 20.0, "gord": 6.22, "fibra": 0.0, "sodio": 54.22, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0361", "nome": "Carne bovina fraldinha com gordura cozida", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 338.45, "carb": 0.0, "prot": 24.24, "gord": 26.05, "fibra": 0.0, "sodio": 38.78, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0362", "nome": "Carne bovina fraldinha com gordura crua", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 220.72, "carb": 0.0, "prot": 17.58, "gord": 16.15, "fibra": 0.0, "sodio": 51.2, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0363", "nome": "Carne bovina lagarto cozido", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 222.47, "carb": 0.0, "prot": 32.86, "gord": 9.11, "fibra": 0.0, "sodio": 47.54, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0364", "nome": "Carne bovina lagarto cru", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 134.86, "carb": 0.0, "prot": 20.54, "gord": 5.23, "fibra": 0.0, "sodio": 53.56, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0365", "nome": "Carne bovina língua cozida", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 314.9, "carb": 0.0, "prot": 21.37, "gord": 24.8, "fibra": 0.0, "sodio": 59.06, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0366", "nome": "Carne bovina língua crua", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 215.25, "carb": 0.0, "prot": 17.09, "gord": 15.77, "fibra": 0.0, "sodio": 73.05, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0367", "nome": "Carne bovina maminha crua", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 152.77, "carb": 0.0, "prot": 20.93, "gord": 7.03, "fibra": 0.0, "sodio": 37.42, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0368", "nome": "Carne bovina maminha grelhada", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 153.09, "carb": 0.0, "prot": 30.74, "gord": 2.42, "fibra": 0.0, "sodio": 58.12, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0369", "nome": "Carne bovina miolo de alcatra sem gordura cru", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 162.87, "carb": 0.0, "prot": 21.61, "gord": 7.83, "fibra": 0.0, "sodio": 43.05, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0370", "nome": "Carne bovina miolo de alcatra sem gordura grelhado", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 241.36, "carb": 0.0, "prot": 31.93, "gord": 11.64, "fibra": 0.0, "sodio": 51.62, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0371", "nome": "Carne bovina músculo sem gordura cozido", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 193.8, "carb": 0.0, "prot": 31.23, "gord": 6.7, "fibra": 0.0, "sodio": 61.79, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0372", "nome": "Carne bovina músculo sem gordura cru", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 141.58, "carb": 0.0, "prot": 21.56, "gord": 5.49, "fibra": 0.0, "sodio": 66.08, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0373", "nome": "Carne bovina paleta com gordura crua", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 158.71, "carb": 0.0, "prot": 21.41, "gord": 7.46, "fibra": 0.0, "sodio": 64.9, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0374", "nome": "Carne bovina paleta sem gordura cozida", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 193.65, "carb": 0.0, "prot": 29.72, "gord": 7.4, "fibra": 0.0, "sodio": 57.62, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0375", "nome": "Carne bovina paleta sem gordura crua", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 140.94, "carb": 0.0, "prot": 21.03, "gord": 5.67, "fibra": 0.0, "sodio": 65.86, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0376", "nome": "Carne bovina patinho sem gordura cru", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 133.47, "carb": 0.0, "prot": 21.72, "gord": 4.51, "fibra": 0.0, "sodio": 49.13, "apto": true, "fonte": "TACO", "tags": ["lean_protein"]}, {"id": "TACO_0377", "nome": "Carne bovina patinho sem gordura grelhado", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 219.26, "carb": 0.0, "prot": 35.9, "gord": 7.31, "fibra": 0.0, "sodio": 60.29, "apto": true, "fonte": "TACO", "tags": ["lean_protein"]}, {"id": "TACO_0378", "nome": "Carne bovina peito sem gordura cozido", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 338.47, "carb": 0.0, "prot": 22.25, "gord": 26.99, "fibra": 0.0, "sodio": 55.71, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0379", "nome": "Carne bovina peito sem gordura cru", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 259.28, "carb": 0.0, "prot": 17.56, "gord": 20.43, "fibra": 0.0, "sodio": 63.76, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0380", "nome": "Carne bovina picanha com gordura crua", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 212.88, "carb": 0.0, "prot": 18.82, "gord": 14.69, "fibra": 0.0, "sodio": 37.62, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0381", "nome": "Carne bovina picanha com gordura grelhada", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 288.77, "carb": 0.0, "prot": 26.42, "gord": 19.51, "fibra": 0.0, "sodio": 60.0, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0382", "nome": "Carne bovina picanha sem gordura crua", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 133.52, "carb": 0.0, "prot": 21.25, "gord": 4.74, "fibra": 0.0, "sodio": 61.15, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0383", "nome": "Carne bovina picanha sem gordura grelhada", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 238.47, "carb": 0.0, "prot": 31.91, "gord": 11.33, "fibra": 0.0, "sodio": 60.66, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0384", "nome": "Carne bovina seca cozida", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 312.8, "carb": 0.0, "prot": 26.93, "gord": 21.93, "fibra": 0.0, "sodio": 1943.18, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0385", "nome": "Carne bovina seca crua", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 312.75, "carb": 0.0, "prot": 19.66, "gord": 25.37, "fibra": 0.0, "sodio": 4439.55, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0386", "nome": "Coxinha de frango frita", "categoria": "Aves", "medida": "1 porção", "porcaoG": 100, "kcal": 283.05, "carb": 34.52, "prot": 9.61, "gord": 11.84, "fibra": 4.97, "sodio": 532.13, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0389", "nome": "Empada de frango pré-cozida assada", "categoria": "Aves", "medida": "1 porção", "porcaoG": 100, "kcal": 358.19, "carb": 47.49, "prot": 6.94, "gord": 15.61, "fibra": 2.16, "sodio": 524.93, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0390", "nome": "Empada de frango pré-cozida", "categoria": "Aves", "medida": "1 porção", "porcaoG": 100, "kcal": 377.48, "carb": 35.53, "prot": 7.34, "gord": 22.89, "fibra": 2.22, "sodio": 770.73, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0391", "nome": "Frango asa com pele crua", "categoria": "Aves", "medida": "1 porção", "porcaoG": 100, "kcal": 213.19, "carb": 0.0, "prot": 18.1, "gord": 15.07, "fibra": 0.0, "sodio": 96.3, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0392", "nome": "Frango caipira inteiro com pele cozido", "categoria": "Aves", "medida": "1 porção", "porcaoG": 100, "kcal": 242.89, "carb": 0.0, "prot": 23.88, "gord": 15.62, "fibra": 0.0, "sodio": 56.09, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0393", "nome": "Frango caipira inteiro sem pele cozido", "categoria": "Aves", "medida": "1 porção", "porcaoG": 100, "kcal": 195.76, "carb": 0.0, "prot": 29.57, "gord": 7.7, "fibra": 0.0, "sodio": 53.24, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0394", "nome": "Frango coração cru", "categoria": "Aves", "medida": "1 porção", "porcaoG": 100, "kcal": 221.5, "carb": 0.0, "prot": 12.58, "gord": 18.6, "fibra": 0.0, "sodio": 95.06, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0395", "nome": "Frango coração grelhado", "categoria": "Aves", "medida": "1 porção", "porcaoG": 100, "kcal": 207.27, "carb": 0.61, "prot": 22.44, "gord": 12.1, "fibra": 0.0, "sodio": 128.24, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0396", "nome": "Frango coxa com pele assada", "categoria": "Aves", "medida": "1 porção", "porcaoG": 100, "kcal": 215.12, "carb": 0.06, "prot": 28.49, "gord": 10.36, "fibra": 0.0, "sodio": 94.84, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0397", "nome": "Frango coxa com pele crua", "categoria": "Aves", "medida": "1 porção", "porcaoG": 100, "kcal": 161.47, "carb": 0.0, "prot": 17.09, "gord": 9.81, "fibra": 0.0, "sodio": 94.96, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0398", "nome": "Frango coxa sem pele cozida", "categoria": "Aves", "medida": "1 porção", "porcaoG": 100, "kcal": 167.43, "carb": 0.0, "prot": 26.86, "gord": 5.85, "fibra": 0.0, "sodio": 64.34, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0399", "nome": "Frango coxa sem pele crua", "categoria": "Aves", "medida": "1 porção", "porcaoG": 100, "kcal": 119.95, "carb": 0.02, "prot": 17.81, "gord": 4.86, "fibra": 0.0, "sodio": 98.37, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0400", "nome": "Frango fígado cru", "categoria": "Aves", "medida": "1 porção", "porcaoG": 100, "kcal": 106.48, "carb": 0.0, "prot": 17.59, "gord": 3.49, "fibra": 0.0, "sodio": 82.43, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0401", "nome": "Frango filé à milanesa", "categoria": "Aves", "medida": "1 porção", "porcaoG": 100, "kcal": 220.87, "carb": 7.51, "prot": 28.46, "gord": 7.79, "fibra": 1.13, "sodio": 122.33, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0402", "nome": "Frango inteiro com pele cru", "categoria": "Aves", "medida": "1 porção", "porcaoG": 100, "kcal": 226.32, "carb": 0.0, "prot": 16.44, "gord": 17.31, "fibra": 0.0, "sodio": 62.88, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0403", "nome": "Frango inteiro sem pele assado", "categoria": "Aves", "medida": "1 porção", "porcaoG": 100, "kcal": 187.34, "carb": 0.0, "prot": 28.02, "gord": 7.5, "fibra": 0.0, "sodio": 70.27, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0404", "nome": "Frango inteiro sem pele cozido", "categoria": "Aves", "medida": "1 porção", "porcaoG": 100, "kcal": 170.39, "carb": 0.0, "prot": 24.99, "gord": 7.06, "fibra": 0.0, "sodio": 50.89, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0405", "nome": "Frango inteiro sem pele cru", "categoria": "Aves", "medida": "1 porção", "porcaoG": 100, "kcal": 129.1, "carb": 0.0, "prot": 20.59, "gord": 4.57, "fibra": 0.0, "sodio": 72.96, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0406", "nome": "Frango peito com pele assado", "categoria": "Aves", "medida": "1 porção", "porcaoG": 100, "kcal": 211.68, "carb": 0.0, "prot": 33.42, "gord": 7.65, "fibra": 0.0, "sodio": 55.7, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0407", "nome": "Frango peito com pele cru", "categoria": "Aves", "medida": "1 porção", "porcaoG": 100, "kcal": 149.47, "carb": 0.0, "prot": 20.78, "gord": 6.73, "fibra": 0.0, "sodio": 62.31, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0408", "nome": "Frango peito sem pele cozido", "categoria": "Aves", "medida": "1 porção", "porcaoG": 100, "kcal": 162.87, "carb": 0.0, "prot": 31.47, "gord": 3.16, "fibra": 0.0, "sodio": 36.17, "apto": true, "fonte": "TACO", "tags": ["lean_protein"]}, {"id": "TACO_0409", "nome": "Frango peito sem pele cru", "categoria": "Aves", "medida": "1 porção", "porcaoG": 100, "kcal": 119.16, "carb": 0.0, "prot": 21.53, "gord": 3.02, "fibra": 0.0, "sodio": 56.14, "apto": true, "fonte": "TACO", "tags": ["lean_protein"]}, {"id": "TACO_0410", "nome": "Frango peito sem pele grelhado", "categoria": "Aves", "medida": "1 porção", "porcaoG": 100, "kcal": 159.19, "carb": 0.0, "prot": 32.03, "gord": 2.48, "fibra": 0.0, "sodio": 50.25, "apto": true, "fonte": "TACO", "tags": ["lean_protein"]}, {"id": "TACO_0411", "nome": "Frango sobrecoxa com pele assada", "categoria": "Aves", "medida": "1 porção", "porcaoG": 100, "kcal": 259.6, "carb": 0.0, "prot": 28.7, "gord": 15.19, "fibra": 0.0, "sodio": 95.94, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0412", "nome": "Frango sobrecoxa com pele crua", "categoria": "Aves", "medida": "1 porção", "porcaoG": 100, "kcal": 254.53, "carb": 0.0, "prot": 15.46, "gord": 20.9, "fibra": 0.0, "sodio": 68.27, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0413", "nome": "Frango sobrecoxa sem pele assada", "categoria": "Aves", "medida": "1 porção", "porcaoG": 100, "kcal": 232.88, "carb": 0.0, "prot": 29.18, "gord": 12.01, "fibra": 0.0, "sodio": 106.08, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0414", "nome": "Frango sobrecoxa sem pele crua", "categoria": "Aves", "medida": "1 porção", "porcaoG": 100, "kcal": 161.8, "carb": 0.0, "prot": 17.57, "gord": 9.62, "fibra": 0.0, "sodio": 79.75, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0418", "nome": "Lingüiça frango crua", "categoria": "Aves", "medida": "1 porção", "porcaoG": 100, "kcal": 218.11, "carb": 0.0, "prot": 14.24, "gord": 17.44, "fibra": 0.0, "sodio": 1125.81, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0419", "nome": "Lingüiça frango frita", "categoria": "Aves", "medida": "1 porção", "porcaoG": 100, "kcal": 245.46, "carb": 0.0, "prot": 18.32, "gord": 18.54, "fibra": 0.0, "sodio": 1373.89, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0420", "nome": "Lingüiça frango grelhada", "categoria": "Aves", "medida": "1 porção", "porcaoG": 100, "kcal": 243.66, "carb": 0.0, "prot": 18.19, "gord": 18.4, "fibra": 0.0, "sodio": 1351.49, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0421", "nome": "Lingüiça porco crua", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 227.2, "carb": 0.0, "prot": 16.06, "gord": 17.58, "fibra": 0.0, "sodio": 1175.72, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0422", "nome": "Lingüiça porco frita", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 279.54, "carb": 0.0, "prot": 20.45, "gord": 21.31, "fibra": 0.0, "sodio": 1431.59, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0423", "nome": "Lingüiça porco grelhada", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 296.49, "carb": 0.0, "prot": 23.17, "gord": 21.9, "fibra": 0.0, "sodio": 1455.86, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0424", "nome": "Mortadela", "categoria": "Industrializados", "medida": "1 porção", "porcaoG": 100, "kcal": 268.82, "carb": 5.82, "prot": 11.95, "gord": 21.65, "fibra": 0.0, "sodio": 1212.17, "apto": true, "fonte": "TACO", "tags": ["ultraprocessed", "processed_meat"]}, {"id": "TACO_0425", "nome": "Peru congelado assado", "categoria": "Aves", "medida": "1 porção", "porcaoG": 100, "kcal": 163.07, "carb": 0.0, "prot": 26.2, "gord": 5.67, "fibra": 0.0, "sodio": 627.88, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0426", "nome": "Peru congelado cru", "categoria": "Aves", "medida": "1 porção", "porcaoG": 100, "kcal": 93.72, "carb": 0.0, "prot": 18.08, "gord": 1.83, "fibra": 0.0, "sodio": 710.68, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0427", "nome": "Porco bisteca crua", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 164.12, "carb": 0.0, "prot": 21.5, "gord": 8.02, "fibra": 0.0, "sodio": 54.29, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0428", "nome": "Porco bisteca frita", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 311.17, "carb": 0.0, "prot": 33.75, "gord": 18.52, "fibra": 0.0, "sodio": 63.03, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0429", "nome": "Porco bisteca grelhada", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 280.08, "carb": 0.0, "prot": 28.89, "gord": 17.38, "fibra": 0.0, "sodio": 51.45, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0430", "nome": "Porco costela assada", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 402.17, "carb": 0.0, "prot": 30.22, "gord": 30.28, "fibra": 0.0, "sodio": 62.68, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0431", "nome": "Porco costela crua", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 255.61, "carb": 0.0, "prot": 18.0, "gord": 19.82, "fibra": 0.0, "sodio": 87.98, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0432", "nome": "Porco lombo assado", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 210.23, "carb": 0.0, "prot": 35.73, "gord": 6.4, "fibra": 0.0, "sodio": 38.92, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0433", "nome": "Porco lombo cru", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 175.63, "carb": 0.0, "prot": 22.6, "gord": 8.77, "fibra": 0.0, "sodio": 53.07, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0434", "nome": "Porco orelha salgada crua", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 258.49, "carb": 0.0, "prot": 18.52, "gord": 19.89, "fibra": 0.0, "sodio": 615.6, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0435", "nome": "Porco pernil assado", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 262.26, "carb": 0.0, "prot": 32.13, "gord": 13.86, "fibra": 0.0, "sodio": 62.41, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0436", "nome": "Porco pernil cru", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 186.06, "carb": 0.0, "prot": 20.12, "gord": 11.1, "fibra": 0.0, "sodio": 101.89, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0437", "nome": "Porco rabo salgado cru", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 377.42, "carb": 0.0, "prot": 15.58, "gord": 34.47, "fibra": 0.0, "sodio": 1157.67, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0438", "nome": "Presunto com capa de gordura", "categoria": "Industrializados", "medida": "1 porção", "porcaoG": 100, "kcal": 127.85, "carb": 1.4, "prot": 14.37, "gord": 6.77, "fibra": 0.0, "sodio": 1020.77, "apto": true, "fonte": "TACO", "tags": ["processed_meat"]}, {"id": "TACO_0439", "nome": "Presunto sem capa de gordura", "categoria": "Industrializados", "medida": "1 porção", "porcaoG": 100, "kcal": 93.74, "carb": 2.15, "prot": 14.29, "gord": 2.71, "fibra": 0.0, "sodio": 1039.18, "apto": true, "fonte": "TACO", "tags": ["processed_meat"]}, {"id": "TACO_0440", "nome": "Quibe assado", "categoria": "Outros", "medida": "1 porção", "porcaoG": 100, "kcal": 136.23, "carb": 12.86, "prot": 14.59, "gord": 2.68, "fibra": 1.9, "sodio": 39.89, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0441", "nome": "Quibe cru", "categoria": "Outros", "medida": "1 porção", "porcaoG": 100, "kcal": 109.49, "carb": 10.77, "prot": 12.35, "gord": 1.67, "fibra": 1.65, "sodio": 38.77, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0443", "nome": "Salame", "categoria": "Industrializados", "medida": "1 porção", "porcaoG": 100, "kcal": 397.84, "carb": 2.91, "prot": 25.81, "gord": 30.64, "fibra": 0.0, "sodio": 1574.17, "apto": true, "fonte": "TACO", "tags": ["ultraprocessed", "processed_meat"]}, {"id": "TACO_0444", "nome": "Toucinho cru", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 592.53, "carb": 0.0, "prot": 11.48, "gord": 60.26, "fibra": 0.0, "sodio": 49.59, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0445", "nome": "Toucinho frito", "categoria": "Carnes", "medida": "1 porção", "porcaoG": 100, "kcal": 696.56, "carb": 0.0, "prot": 27.28, "gord": 64.31, "fibra": 0.0, "sodio": 124.85, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0446", "nome": "Bebida láctea pêssego", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 55.16, "carb": 7.57, "prot": 2.13, "gord": 1.91, "fibra": 0.29, "sodio": 46.26, "apto": true, "fonte": "TACO", "tags": ["fruit"]}, {"id": "TACO_0447", "nome": "Creme de Leite", "categoria": "Laticínios", "medida": "1 porção", "porcaoG": 100, "kcal": 221.48, "carb": 4.51, "prot": 1.51, "gord": 22.48, "fibra": 0.0, "sodio": 51.72, "apto": true, "fonte": "TACO", "tags": ["dairy"]}, {"id": "TACO_0448", "nome": "Iogurte natural", "categoria": "Laticínios", "medida": "1 porção", "porcaoG": 100, "kcal": 51.49, "carb": 1.92, "prot": 4.06, "gord": 3.04, "fibra": 0.0, "sodio": 51.62, "apto": true, "fonte": "TACO", "tags": ["dairy"]}, {"id": "TACO_0449", "nome": "Iogurte natural desnatado", "categoria": "Laticínios", "medida": "1 porção", "porcaoG": 100, "kcal": 41.49, "carb": 5.77, "prot": 3.83, "gord": 0.32, "fibra": 0.0, "sodio": 59.64, "apto": true, "fonte": "TACO", "tags": ["dairy"]}, {"id": "TACO_0451", "nome": "Iogurte sabor morango", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 69.57, "carb": 9.69, "prot": 2.71, "gord": 2.33, "fibra": 0.22, "sodio": 37.66, "apto": true, "fonte": "TACO", "tags": ["fruit", "dairy"]}, {"id": "TACO_0452", "nome": "Iogurte sabor pêssego", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 67.85, "carb": 9.43, "prot": 2.53, "gord": 2.34, "fibra": 0.72, "sodio": 36.96, "apto": true, "fonte": "TACO", "tags": ["fruit", "dairy"]}, {"id": "TACO_0453", "nome": "Leite condensado", "categoria": "Laticínios", "medida": "1 porção", "porcaoG": 100, "kcal": 312.57, "carb": 57.0, "prot": 7.67, "gord": 6.74, "fibra": 0.0, "sodio": 93.8, "apto": true, "fonte": "TACO", "tags": ["dairy"]}, {"id": "TACO_0454", "nome": "Leite de cabra", "categoria": "Laticínios", "medida": "1 porção", "porcaoG": 100, "kcal": 66.42, "carb": 5.25, "prot": 3.07, "gord": 3.75, "fibra": 0.0, "sodio": 73.95, "apto": true, "fonte": "TACO", "tags": ["dairy"]}, {"id": "TACO_0455", "nome": "Leite de vaca achocolatado", "categoria": "Laticínios", "medida": "1 porção", "porcaoG": 100, "kcal": 82.82, "carb": 14.16, "prot": 2.1, "gord": 2.17, "fibra": 0.65, "sodio": 71.74, "apto": true, "fonte": "TACO", "tags": ["sugary_drink", "ultraprocessed", "dairy"]}, {"id": "TACO_0456", "nome": "Leite de vaca desnatado pó", "categoria": "Laticínios", "medida": "1 porção", "porcaoG": 100, "kcal": 361.61, "carb": 53.04, "prot": 34.69, "gord": 0.93, "fibra": 0.0, "sodio": 431.67, "apto": true, "fonte": "TACO", "tags": ["dairy"]}, {"id": "TACO_0459", "nome": "Leite de vaca integral pó", "categoria": "Laticínios", "medida": "1 porção", "porcaoG": 100, "kcal": 496.65, "carb": 39.18, "prot": 25.42, "gord": 26.9, "fibra": 0.0, "sodio": 323.2, "apto": true, "fonte": "TACO", "tags": ["whole_grain", "dairy"]}, {"id": "TACO_0460", "nome": "Leite fermentado", "categoria": "Laticínios", "medida": "1 porção", "porcaoG": 100, "kcal": 69.62, "carb": 15.67, "prot": 1.89, "gord": 0.1, "fibra": 0.0, "sodio": 33.43, "apto": true, "fonte": "TACO", "tags": ["dairy"]}, {"id": "TACO_0461", "nome": "Queijo minas frescal", "categoria": "Laticínios", "medida": "1 porção", "porcaoG": 100, "kcal": 264.27, "carb": 3.24, "prot": 17.41, "gord": 20.18, "fibra": 0.0, "sodio": 31.23, "apto": true, "fonte": "TACO", "tags": ["dairy"]}, {"id": "TACO_0462", "nome": "Queijo minas meia cura", "categoria": "Laticínios", "medida": "1 porção", "porcaoG": 100, "kcal": 320.72, "carb": 3.57, "prot": 21.21, "gord": 24.61, "fibra": 0.0, "sodio": 501.17, "apto": true, "fonte": "TACO", "tags": ["dairy"]}, {"id": "TACO_0463", "nome": "Queijo mozarela", "categoria": "Laticínios", "medida": "1 porção", "porcaoG": 100, "kcal": 329.87, "carb": 3.05, "prot": 22.65, "gord": 25.18, "fibra": 0.0, "sodio": 581.36, "apto": true, "fonte": "TACO", "tags": ["dairy"]}, {"id": "TACO_0464", "nome": "Queijo parmesão", "categoria": "Laticínios", "medida": "1 porção", "porcaoG": 100, "kcal": 452.96, "carb": 1.66, "prot": 35.55, "gord": 33.53, "fibra": 0.0, "sodio": 1844.08, "apto": true, "fonte": "TACO", "tags": ["dairy"]}, {"id": "TACO_0465", "nome": "Queijo pasteurizado", "categoria": "Laticínios", "medida": "1 porção", "porcaoG": 100, "kcal": 303.08, "carb": 5.68, "prot": 9.36, "gord": 27.44, "fibra": 0.0, "sodio": 780.43, "apto": true, "fonte": "TACO", "tags": ["dairy"]}, {"id": "TACO_0466", "nome": "Queijo petit suisse morango", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 121.11, "carb": 18.46, "prot": 5.79, "gord": 2.84, "fibra": 0.0, "sodio": 412.47, "apto": true, "fonte": "TACO", "tags": ["fruit", "dairy"]}, {"id": "TACO_0467", "nome": "Queijo prato", "categoria": "Laticínios", "medida": "1 porção", "porcaoG": 100, "kcal": 359.88, "carb": 1.88, "prot": 22.66, "gord": 29.11, "fibra": 0.0, "sodio": 579.77, "apto": true, "fonte": "TACO", "tags": ["dairy"]}, {"id": "TACO_0468", "nome": "Queijo requeijão cremoso", "categoria": "Laticínios", "medida": "1 porção", "porcaoG": 100, "kcal": 256.58, "carb": 2.43, "prot": 9.63, "gord": 23.44, "fibra": 0.0, "sodio": 557.92, "apto": true, "fonte": "TACO", "tags": ["dairy"]}, {"id": "TACO_0469", "nome": "Queijo ricota", "categoria": "Laticínios", "medida": "1 porção", "porcaoG": 100, "kcal": 139.73, "carb": 3.79, "prot": 12.6, "gord": 8.11, "fibra": 0.0, "sodio": 282.58, "apto": true, "fonte": "TACO", "tags": ["dairy"]}, {"id": "TACO_0470", "nome": "Bebida isotônica sabores variados", "categoria": "Bebidas (alcoólicas e não alcoólicas)", "medida": "1 porção", "porcaoG": 100, "kcal": 25.61, "carb": 6.4, "prot": 0.0, "gord": 0.0, "fibra": 0.0, "sodio": 44.08, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0471", "nome": "Café infusão 10%", "categoria": "Bebidas", "medida": "1 copo", "porcaoG": 100, "kcal": 9.07, "carb": 1.48, "prot": 0.71, "gord": 0.07, "fibra": 0.0, "sodio": 1.03, "apto": true, "fonte": "TACO", "tags": ["unsweetened_drink"]}, {"id": "TACO_0473", "nome": "Cana caldo de", "categoria": "Bebidas (alcoólicas e não alcoólicas)", "medida": "1 porção", "porcaoG": 100, "kcal": 65.34, "carb": 18.15, "prot": 0.0, "gord": 0.0, "fibra": 0.14, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0474", "nome": "Cerveja pilsen 2", "categoria": "Bebidas", "medida": "1 copo", "porcaoG": 100, "kcal": 40.72, "carb": 3.32, "prot": 0.56, "gord": 0.0, "fibra": 0.0, "sodio": 4.23, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0475", "nome": "Chá erva-doce infusão 5%", "categoria": "Bebidas", "medida": "1 copo", "porcaoG": 100, "kcal": 1.4, "carb": 0.39, "prot": 0.0, "gord": 0.0, "fibra": 0.0, "sodio": 0.63, "apto": true, "fonte": "TACO", "tags": ["unsweetened_drink", "sweet"]}, {"id": "TACO_0476", "nome": "Chá mate infusão 5%", "categoria": "Bebidas", "medida": "1 copo", "porcaoG": 100, "kcal": 2.73, "carb": 0.64, "prot": 0.0, "gord": 0.05, "fibra": 0.0, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": ["unsweetened_drink"]}, {"id": "TACO_0477", "nome": "Chá preto infusão 5%", "categoria": "Bebidas", "medida": "1 copo", "porcaoG": 100, "kcal": 2.25, "carb": 0.63, "prot": 0.0, "gord": 0.0, "fibra": 0.0, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": ["unsweetened_drink"]}, {"id": "TACO_0478", "nome": "Coco água de", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 21.51, "carb": 5.28, "prot": 0.0, "gord": 0.0, "fibra": 0.13, "sodio": 1.78, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0479", "nome": "Refrigerante tipo água tônica", "categoria": "Bebidas", "medida": "1 copo", "porcaoG": 100, "kcal": 30.78, "carb": 7.95, "prot": 0.0, "gord": 0.0, "fibra": 0.0, "sodio": 8.29, "apto": true, "fonte": "TACO", "tags": ["sugary_drink", "ultraprocessed"]}, {"id": "TACO_0480", "nome": "Refrigerante tipo cola", "categoria": "Bebidas", "medida": "1 copo", "porcaoG": 100, "kcal": 33.51, "carb": 8.66, "prot": 0.0, "gord": 0.0, "fibra": 0.0, "sodio": 7.12, "apto": true, "fonte": "TACO", "tags": ["sugary_drink", "ultraprocessed"]}, {"id": "TACO_0481", "nome": "Refrigerante tipo guaraná", "categoria": "Bebidas", "medida": "1 copo", "porcaoG": 100, "kcal": 38.7, "carb": 10.0, "prot": 0.0, "gord": 0.0, "fibra": 0.0, "sodio": 9.01, "apto": true, "fonte": "TACO", "tags": ["sugary_drink", "ultraprocessed"]}, {"id": "TACO_0482", "nome": "Refrigerante tipo laranja", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 45.63, "carb": 11.79, "prot": 0.0, "gord": 0.0, "fibra": 0.0, "sodio": 9.27, "apto": true, "fonte": "TACO", "tags": ["sugary_drink", "ultraprocessed", "fruit"]}, {"id": "TACO_0483", "nome": "Refrigerante tipo limão", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 39.72, "carb": 10.26, "prot": 0.0, "gord": 0.0, "fibra": 0.0, "sodio": 8.8, "apto": true, "fonte": "TACO", "tags": ["sugary_drink", "ultraprocessed", "fruit"]}, {"id": "TACO_0484", "nome": "Omelete de queijo", "categoria": "Laticínios", "medida": "1 porção", "porcaoG": 100, "kcal": 268.01, "carb": 0.44, "prot": 15.57, "gord": 22.01, "fibra": 0.0, "sodio": 216.05, "apto": true, "fonte": "TACO", "tags": ["dairy"]}, {"id": "TACO_0485", "nome": "Ovo de codorna inteiro cru", "categoria": "Ovos", "medida": "1 unidade", "porcaoG": 100, "kcal": 176.89, "carb": 0.77, "prot": 13.69, "gord": 12.68, "fibra": 0.0, "sodio": 128.99, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0486", "nome": "Ovo de galinha clara cozida/10minutos", "categoria": "Aves", "medida": "1 porção", "porcaoG": 100, "kcal": 59.44, "carb": 0.0, "prot": 13.45, "gord": 0.09, "fibra": 0.0, "sodio": 180.54, "apto": true, "fonte": "TACO", "tags": ["lean_protein"]}, {"id": "TACO_0487", "nome": "Ovo de galinha gema cozida/10minutos", "categoria": "Aves", "medida": "1 porção", "porcaoG": 100, "kcal": 352.67, "carb": 1.56, "prot": 15.9, "gord": 30.78, "fibra": 0.0, "sodio": 44.91, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0488", "nome": "Ovo de galinha inteiro cozido/10minutos", "categoria": "Aves", "medida": "1 porção", "porcaoG": 100, "kcal": 145.7, "carb": 0.61, "prot": 13.29, "gord": 9.48, "fibra": 0.0, "sodio": 145.9, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0489", "nome": "Ovo de galinha inteiro cru", "categoria": "Aves", "medida": "1 porção", "porcaoG": 100, "kcal": 143.11, "carb": 1.64, "prot": 13.03, "gord": 8.9, "fibra": 0.0, "sodio": 167.91, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0490", "nome": "Ovo de galinha inteiro frito", "categoria": "Aves", "medida": "1 porção", "porcaoG": 100, "kcal": 240.19, "carb": 1.19, "prot": 15.62, "gord": 18.59, "fibra": 0.0, "sodio": 166.11, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0491", "nome": "Achocolatado pó", "categoria": "Bebidas", "medida": "1 copo", "porcaoG": 100, "kcal": 401.02, "carb": 91.18, "prot": 4.2, "gord": 2.17, "fibra": 3.89, "sodio": 64.79, "apto": true, "fonte": "TACO", "tags": ["sugary_drink", "ultraprocessed"]}, {"id": "TACO_0492", "nome": "Açúcar cristal", "categoria": "Doces e sobremesas", "medida": "1 porção", "porcaoG": 100, "kcal": 386.85, "carb": 99.61, "prot": 0.32, "gord": 0.0, "fibra": 0.0, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": ["sweet"]}, {"id": "TACO_0493", "nome": "Açúcar mascavo", "categoria": "Doces e sobremesas", "medida": "1 porção", "porcaoG": 100, "kcal": 368.55, "carb": 94.45, "prot": 0.76, "gord": 0.09, "fibra": 0.0, "sodio": 25.2, "apto": true, "fonte": "TACO", "tags": ["sweet"]}, {"id": "TACO_0494", "nome": "Açúcar refinado", "categoria": "Doces e sobremesas", "medida": "1 porção", "porcaoG": 100, "kcal": 386.57, "carb": 99.54, "prot": 0.32, "gord": 0.0, "fibra": 0.0, "sodio": 12.16, "apto": true, "fonte": "TACO", "tags": ["sweet"]}, {"id": "TACO_0495", "nome": "Chocolate ao leite", "categoria": "Laticínios", "medida": "1 porção", "porcaoG": 100, "kcal": 539.59, "carb": 59.58, "prot": 7.22, "gord": 30.27, "fibra": 2.17, "sodio": 77.1, "apto": true, "fonte": "TACO", "tags": ["sweet", "dairy"]}, {"id": "TACO_0496", "nome": "Chocolate ao leite com castanha do Pará", "categoria": "Laticínios", "medida": "1 porção", "porcaoG": 100, "kcal": 558.88, "carb": 55.38, "prot": 7.41, "gord": 34.19, "fibra": 2.46, "sodio": 64.05, "apto": true, "fonte": "TACO", "tags": ["sweet", "dairy", "nuts_seeds"]}, {"id": "TACO_0497", "nome": "Chocolate ao leite dietético", "categoria": "Laticínios", "medida": "1 porção", "porcaoG": 100, "kcal": 556.82, "carb": 56.32, "prot": 6.9, "gord": 33.77, "fibra": 2.85, "sodio": 84.71, "apto": true, "fonte": "TACO", "tags": ["sweet", "dairy"]}, {"id": "TACO_0498", "nome": "Chocolate meio amargo", "categoria": "Doces e sobremesas", "medida": "1 porção", "porcaoG": 100, "kcal": 474.92, "carb": 62.42, "prot": 4.86, "gord": 29.86, "fibra": 4.94, "sodio": 8.87, "apto": true, "fonte": "TACO", "tags": ["sweet"]}, {"id": "TACO_0499", "nome": "Cocada branca", "categoria": "Doces e sobremesas", "medida": "1 porção", "porcaoG": 100, "kcal": 448.85, "carb": 81.38, "prot": 1.12, "gord": 13.59, "fibra": 3.57, "sodio": 28.99, "apto": true, "fonte": "TACO", "tags": ["sweet"]}, {"id": "TACO_0500", "nome": "Doce de abóbora cremoso", "categoria": "Verduras e legumes", "medida": "1 porção", "porcaoG": 100, "kcal": 198.94, "carb": 54.61, "prot": 0.92, "gord": 0.21, "fibra": 2.28, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": ["sweet", "starchy_vegetable"]}, {"id": "TACO_0501", "nome": "Doce de leite cremoso", "categoria": "Laticínios", "medida": "1 porção", "porcaoG": 100, "kcal": 306.31, "carb": 59.49, "prot": 5.48, "gord": 5.99, "fibra": 0.0, "sodio": 120.09, "apto": true, "fonte": "TACO", "tags": ["sweet", "dairy"]}, {"id": "TACO_0502", "nome": "Geléia mocotó natural", "categoria": "Outros", "medida": "1 porção", "porcaoG": 100, "kcal": 106.09, "carb": 24.23, "prot": 2.12, "gord": 0.07, "fibra": 0.0, "sodio": 42.68, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0503", "nome": "Glicose de milho", "categoria": "Cereais", "medida": "4 colheres de sopa", "porcaoG": 100, "kcal": 292.12, "carb": 79.38, "prot": 0.0, "gord": 0.0, "fibra": 0.0, "sodio": 58.93, "apto": true, "fonte": "TACO", "tags": ["starchy_vegetable"]}, {"id": "TACO_0504", "nome": "Maria mole", "categoria": "Outros", "medida": "1 porção", "porcaoG": 100, "kcal": 301.24, "carb": 73.55, "prot": 3.81, "gord": 0.19, "fibra": 0.67, "sodio": 15.31, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0505", "nome": "Maria mole coco queimado", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 306.63, "carb": 75.06, "prot": 3.93, "gord": 0.09, "fibra": 0.64, "sodio": 14.29, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0506", "nome": "Marmelada", "categoria": "Outros", "medida": "1 porção", "porcaoG": 100, "kcal": 257.24, "carb": 70.76, "prot": 0.4, "gord": 0.14, "fibra": 4.07, "sodio": 10.88, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0507", "nome": "Mel de abelha", "categoria": "Doces e sobremesas", "medida": "1 porção", "porcaoG": 100, "kcal": 309.24, "carb": 84.03, "prot": 0.0, "gord": 0.0, "fibra": 0.0, "sodio": 6.04, "apto": true, "fonte": "TACO", "tags": ["sweet"]}, {"id": "TACO_0508", "nome": "Melado", "categoria": "Outros", "medida": "1 porção", "porcaoG": 100, "kcal": 296.51, "carb": 76.62, "prot": 0.0, "gord": 0.0, "fibra": 0.0, "sodio": 4.01, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0509", "nome": "Quindim", "categoria": "Doces e sobremesas", "medida": "1 porção", "porcaoG": 100, "kcal": 411.35, "carb": 46.3, "prot": 4.74, "gord": 24.43, "fibra": 3.22, "sodio": 27.37, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0510", "nome": "Rapadura", "categoria": "Doces e sobremesas", "medida": "1 porção", "porcaoG": 100, "kcal": 351.96, "carb": 90.79, "prot": 0.99, "gord": 0.07, "fibra": 0.0, "sodio": 21.71, "apto": true, "fonte": "TACO", "tags": ["sweet"]}, {"id": "TACO_0511", "nome": "Café pó torrado", "categoria": "Bebidas", "medida": "1 copo", "porcaoG": 100, "kcal": 418.62, "carb": 65.75, "prot": 14.7, "gord": 11.95, "fibra": 51.23, "sodio": 1.13, "apto": true, "fonte": "TACO", "tags": ["unsweetened_drink"]}, {"id": "TACO_0512", "nome": "Capuccino pó", "categoria": "Miscelâneas", "medida": "1 porção", "porcaoG": 100, "kcal": 417.41, "carb": 73.61, "prot": 11.31, "gord": 8.63, "fibra": 2.44, "sodio": 382.29, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0513", "nome": "Fermento em pó químico", "categoria": "Miscelâneas", "medida": "1 porção", "porcaoG": 100, "kcal": 89.72, "carb": 43.91, "prot": 0.48, "gord": 0.07, "fibra": 0.0, "sodio": 10052.41, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0514", "nome": "Fermento biológico levedura tablete", "categoria": "Miscelâneas", "medida": "1 porção", "porcaoG": 100, "kcal": 89.79, "carb": 7.7, "prot": 16.96, "gord": 1.52, "fibra": 4.17, "sodio": 39.61, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0515", "nome": "Gelatina sabores variados pó", "categoria": "Doces e sobremesas", "medida": "1 porção", "porcaoG": 100, "kcal": 380.22, "carb": 89.22, "prot": 8.89, "gord": 0.0, "fibra": 0.0, "sodio": 234.92, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0518", "nome": "Shoyu", "categoria": "Temperos e condimentos", "medida": "1 porção", "porcaoG": 100, "kcal": 60.93, "carb": 11.65, "prot": 3.31, "gord": 0.33, "fibra": 0.0, "sodio": 5024.21, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0519", "nome": "Tempero a base de sal", "categoria": "Temperos e condimentos", "medida": "1 porção", "porcaoG": 100, "kcal": 21.33, "carb": 2.07, "prot": 2.67, "gord": 0.26, "fibra": 0.56, "sodio": 32560.0, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0520", "nome": "Azeitona preta conserva", "categoria": "Outros alimentos industrializados", "medida": "1 porção", "porcaoG": 100, "kcal": 194.15, "carb": 5.54, "prot": 1.16, "gord": 20.34, "fibra": 4.55, "sodio": 1566.66, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0521", "nome": "Azeitona verde conserva", "categoria": "Outros", "medida": "1 porção", "porcaoG": 100, "kcal": 136.94, "carb": 4.1, "prot": 0.95, "gord": 14.22, "fibra": 3.85, "sodio": 1347.18, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0522", "nome": "Chantilly spray com gordura vegetal", "categoria": "Outros", "medida": "1 porção", "porcaoG": 100, "kcal": 314.96, "carb": 16.86, "prot": 0.53, "gord": 27.27, "fibra": 0.0, "sodio": 109.7, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0523", "nome": "Leite de coco", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 166.16, "carb": 2.19, "prot": 1.01, "gord": 18.36, "fibra": 0.68, "sodio": 44.29, "apto": true, "fonte": "TACO", "tags": ["dairy"]}, {"id": "TACO_0524", "nome": "Maionese tradicional com ovos", "categoria": "Industrializados", "medida": "1 porção", "porcaoG": 100, "kcal": 302.15, "carb": 7.9, "prot": 0.58, "gord": 30.5, "fibra": 0.0, "sodio": 786.83, "apto": true, "fonte": "TACO", "tags": ["ultraprocessed"]}, {"id": "TACO_0525", "nome": "Acarajé", "categoria": "Preparações brasileiras", "medida": "1 porção", "porcaoG": 100, "kcal": 289.21, "carb": 19.11, "prot": 8.35, "gord": 19.93, "fibra": 9.36, "sodio": 304.89, "apto": true, "fonte": "TACO", "tags": ["home_preparation"]}, {"id": "TACO_0526", "nome": "Arroz carreteiro", "categoria": "Cereais", "medida": "4 colheres de sopa", "porcaoG": 100, "kcal": 153.77, "carb": 11.58, "prot": 10.83, "gord": 7.12, "fibra": 1.5, "sodio": 1621.73, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0527", "nome": "Baião de dois arroz e feijão-de-corda", "categoria": "Leguminosas", "medida": "1 concha", "porcaoG": 100, "kcal": 135.68, "carb": 20.42, "prot": 6.24, "gord": 3.23, "fibra": 5.07, "sodio": 93.3, "apto": true, "fonte": "TACO", "tags": ["legume"]}, {"id": "TACO_0528", "nome": "Barreado", "categoria": "Alimentos preparados", "medida": "1 porção", "porcaoG": 100, "kcal": 164.98, "carb": 0.24, "prot": 18.27, "gord": 9.53, "fibra": 0.15, "sodio": 47.63, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0529", "nome": "Bife à cavalo com contra filé", "categoria": "Alimentos preparados", "medida": "1 porção", "porcaoG": 100, "kcal": 291.23, "carb": 0.0, "prot": 23.66, "gord": 21.15, "fibra": 0.0, "sodio": 82.87, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0530", "nome": "Bolinho de arroz", "categoria": "Cereais", "medida": "4 colheres de sopa", "porcaoG": 100, "kcal": 273.51, "carb": 41.68, "prot": 8.04, "gord": 8.29, "fibra": 2.74, "sodio": 58.86, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0531", "nome": "Camarão à baiana", "categoria": "Peixes e frutos do mar", "medida": "1 filé", "porcaoG": 100, "kcal": 100.78, "carb": 3.17, "prot": 7.94, "gord": 5.97, "fibra": 0.39, "sodio": 84.79, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0532", "nome": "Charuto de repolho", "categoria": "Verduras e legumes", "medida": "1 porção", "porcaoG": 100, "kcal": 78.23, "carb": 10.13, "prot": 6.78, "gord": 1.12, "fibra": 1.46, "sodio": 12.1, "apto": true, "fonte": "TACO", "tags": ["non_starchy_vegetable"]}, {"id": "TACO_0533", "nome": "Cuscuz de milho cozido com sal", "categoria": "Cereais", "medida": "4 colheres de sopa", "porcaoG": 100, "kcal": 113.46, "carb": 25.28, "prot": 2.16, "gord": 0.68, "fibra": 2.05, "sodio": 247.67, "apto": true, "fonte": "TACO", "tags": ["starchy_vegetable", "refined_grain"]}, {"id": "TACO_0534", "nome": "Cuscuz paulista", "categoria": "Cereais", "medida": "4 colheres de sopa", "porcaoG": 100, "kcal": 142.12, "carb": 22.51, "prot": 2.56, "gord": 4.65, "fibra": 2.43, "sodio": 235.71, "apto": true, "fonte": "TACO", "tags": ["refined_grain"]}, {"id": "TACO_0535", "nome": "Cuxá molho", "categoria": "Temperos e condimentos", "medida": "1 porção", "porcaoG": 100, "kcal": 80.09, "carb": 5.74, "prot": 5.64, "gord": 3.59, "fibra": 3.02, "sodio": 1344.29, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0536", "nome": "Dobradinha", "categoria": "Alimentos preparados", "medida": "1 porção", "porcaoG": 100, "kcal": 124.5, "carb": 0.0, "prot": 19.77, "gord": 4.44, "fibra": 0.0, "sodio": 28.77, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0539", "nome": "Feijão tropeiro mineiro", "categoria": "Leguminosas", "medida": "1 concha", "porcaoG": 100, "kcal": 151.56, "carb": 19.58, "prot": 10.17, "gord": 6.79, "fibra": 3.57, "sodio": 365.07, "apto": true, "fonte": "TACO", "tags": ["legume"]}, {"id": "TACO_0540", "nome": "L", "categoria": "Alimentos preparados", "medida": "1 porção", "porcaoG": 100, "kcal": 116.93, "carb": 11.64, "prot": 8.67, "gord": 6.48, "fibra": 5.09, "sodio": 278.22, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0541", "nome": "Frango com açafrão", "categoria": "Aves", "medida": "1 porção", "porcaoG": 100, "kcal": 112.78, "carb": 4.06, "prot": 9.7, "gord": 6.17, "fibra": 0.22, "sodio": 28.81, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0542", "nome": "Macarrão molho bolognesa", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 119.53, "carb": 22.52, "prot": 4.93, "gord": 0.89, "fibra": 0.78, "sodio": 8.94, "apto": true, "fonte": "TACO", "tags": ["sweet", "fruit", "refined_grain"]}, {"id": "TACO_0543", "nome": "Maniçoba", "categoria": "Alimentos preparados", "medida": "1 porção", "porcaoG": 100, "kcal": 134.22, "carb": 3.42, "prot": 9.96, "gord": 8.7, "fibra": 2.16, "sodio": 406.7, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0544", "nome": "Quibebe", "categoria": "Alimentos preparados", "medida": "1 porção", "porcaoG": 100, "kcal": 86.35, "carb": 6.64, "prot": 8.56, "gord": 2.67, "fibra": 1.67, "sodio": 246.61, "apto": true, "fonte": "TACO", "tags": ["home_preparation"]}, {"id": "TACO_0545", "nome": "Salada de legumes com maionese", "categoria": "Verduras e legumes", "medida": "1 porção", "porcaoG": 100, "kcal": 96.1, "carb": 8.92, "prot": 1.05, "gord": 7.04, "fibra": 2.22, "sodio": 228.43, "apto": true, "fonte": "TACO", "tags": ["ultraprocessed"]}, {"id": "TACO_0546", "nome": "Salada de legumes cozida no vapor", "categoria": "Verduras e legumes", "medida": "1 porção", "porcaoG": 100, "kcal": 35.41, "carb": 7.09, "prot": 2.01, "gord": 0.31, "fibra": 2.51, "sodio": 2.51, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0547", "nome": "Salpicão de frango", "categoria": "Aves", "medida": "1 porção", "porcaoG": 100, "kcal": 147.86, "carb": 4.57, "prot": 13.93, "gord": 7.84, "fibra": 0.41, "sodio": 248.35, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0549", "nome": "Tabule", "categoria": "Alimentos preparados", "medida": "1 porção", "porcaoG": 100, "kcal": 57.45, "carb": 10.58, "prot": 2.05, "gord": 1.21, "fibra": 2.08, "sodio": 1.19, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0550", "nome": "Tacacá", "categoria": "Preparações brasileiras", "medida": "1 porção", "porcaoG": 100, "kcal": 46.89, "carb": 3.39, "prot": 6.96, "gord": 0.36, "fibra": 0.21, "sodio": 1349.06, "apto": true, "fonte": "TACO", "tags": ["home_preparation"]}, {"id": "TACO_0551", "nome": "Tapioca com manteiga", "categoria": "Laticínios", "medida": "1 porção", "porcaoG": 100, "kcal": 347.83, "carb": 63.59, "prot": 0.09, "gord": 10.91, "fibra": 0.0, "sodio": 157.52, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0552", "nome": "Tucupi com pimenta-de-cheiro", "categoria": "Temperos e condimentos", "medida": "1 porção", "porcaoG": 100, "kcal": 27.18, "carb": 4.74, "prot": 2.06, "gord": 0.28, "fibra": 0.23, "sodio": 5.13, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0553", "nome": "Vaca atolada", "categoria": "Outros", "medida": "1 porção", "porcaoG": 100, "kcal": 144.9, "carb": 10.06, "prot": 5.12, "gord": 9.32, "fibra": 2.34, "sodio": 25.63, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0554", "nome": "Vatapá", "categoria": "Preparações brasileiras", "medida": "1 porção", "porcaoG": 100, "kcal": 254.89, "carb": 9.75, "prot": 6.0, "gord": 23.23, "fibra": 1.7, "sodio": 879.85, "apto": true, "fonte": "TACO", "tags": ["home_preparation"]}, {"id": "TACO_0555", "nome": "Virado à paulista", "categoria": "Outros", "medida": "1 porção", "porcaoG": 100, "kcal": 306.95, "carb": 14.11, "prot": 10.18, "gord": 25.59, "fibra": 2.16, "sodio": 345.53, "apto": true, "fonte": "TACO", "tags": ["home_preparation"]}, {"id": "TACO_0556", "nome": "Yakisoba", "categoria": "Outros", "medida": "1 porção", "porcaoG": 100, "kcal": 112.8, "carb": 18.25, "prot": 7.52, "gord": 2.61, "fibra": 1.06, "sodio": 793.76, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0557", "nome": "Amendoim grão cru", "categoria": "Oleaginosas", "medida": "1 porção", "porcaoG": 100, "kcal": 544.05, "carb": 20.31, "prot": 27.19, "gord": 43.85, "fibra": 8.04, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": ["nuts_seeds"]}, {"id": "TACO_0558", "nome": "Amendoim torrado salgado", "categoria": "Oleaginosas", "medida": "1 porção", "porcaoG": 100, "kcal": 605.78, "carb": 18.7, "prot": 22.48, "gord": 53.96, "fibra": 7.76, "sodio": 375.73, "apto": true, "fonte": "TACO", "tags": ["nuts_seeds"]}, {"id": "TACO_0559", "nome": "Ervilha em vagem", "categoria": "Verduras e legumes", "medida": "1 porção", "porcaoG": 100, "kcal": 88.09, "carb": 14.23, "prot": 7.45, "gord": 0.47, "fibra": 9.72, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": ["non_starchy_vegetable", "legume"]}, {"id": "TACO_0560", "nome": "Ervilha enlatada drenada", "categoria": "Leguminosas", "medida": "1 concha", "porcaoG": 100, "kcal": 73.84, "carb": 13.44, "prot": 4.6, "gord": 0.38, "fibra": 5.08, "sodio": 372.11, "apto": true, "fonte": "TACO", "tags": ["legume"]}, {"id": "TACO_0561", "nome": "Feijão carioca cozido", "categoria": "Leguminosas", "medida": "1 concha", "porcaoG": 100, "kcal": 76.42, "carb": 13.59, "prot": 4.78, "gord": 0.54, "fibra": 8.51, "sodio": 1.76, "apto": true, "fonte": "TACO", "tags": ["legume"]}, {"id": "TACO_0562", "nome": "Feijão carioca cru", "categoria": "Leguminosas", "medida": "1 concha", "porcaoG": 100, "kcal": 329.03, "carb": 61.22, "prot": 19.98, "gord": 1.26, "fibra": 18.42, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": ["legume"]}, {"id": "TACO_0563", "nome": "Feijão fradinho cozido", "categoria": "Leguminosas", "medida": "1 concha", "porcaoG": 100, "kcal": 78.01, "carb": 13.5, "prot": 5.09, "gord": 0.64, "fibra": 7.47, "sodio": 0.98, "apto": true, "fonte": "TACO", "tags": ["legume"]}, {"id": "TACO_0564", "nome": "Feijão fradinho cru", "categoria": "Leguminosas", "medida": "1 concha", "porcaoG": 100, "kcal": 339.16, "carb": 61.24, "prot": 20.21, "gord": 2.37, "fibra": 23.59, "sodio": 10.31, "apto": true, "fonte": "TACO", "tags": ["legume"]}, {"id": "TACO_0565", "nome": "Feijão jalo cozido", "categoria": "Leguminosas", "medida": "1 concha", "porcaoG": 100, "kcal": 92.74, "carb": 16.5, "prot": 6.14, "gord": 0.51, "fibra": 13.87, "sodio": 0.52, "apto": true, "fonte": "TACO", "tags": ["legume"]}, {"id": "TACO_0566", "nome": "Feijão jalo cru", "categoria": "Leguminosas", "medida": "1 concha", "porcaoG": 100, "kcal": 327.91, "carb": 61.48, "prot": 20.1, "gord": 0.95, "fibra": 30.32, "sodio": 24.58, "apto": true, "fonte": "TACO", "tags": ["legume"]}, {"id": "TACO_0567", "nome": "Feijão preto cozido", "categoria": "Leguminosas", "medida": "1 concha", "porcaoG": 100, "kcal": 77.03, "carb": 14.01, "prot": 4.48, "gord": 0.54, "fibra": 8.4, "sodio": 1.85, "apto": true, "fonte": "TACO", "tags": ["legume"]}, {"id": "TACO_0568", "nome": "Feijão preto cru", "categoria": "Leguminosas", "medida": "1 concha", "porcaoG": 100, "kcal": 323.57, "carb": 58.75, "prot": 21.34, "gord": 1.24, "fibra": 21.83, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": ["legume"]}, {"id": "TACO_0569", "nome": "Feijão rajado cozido", "categoria": "Leguminosas", "medida": "1 concha", "porcaoG": 100, "kcal": 84.7, "carb": 15.27, "prot": 5.54, "gord": 0.4, "fibra": 9.32, "sodio": 0.69, "apto": true, "fonte": "TACO", "tags": ["legume"]}, {"id": "TACO_0570", "nome": "Feijão rajado cru", "categoria": "Leguminosas", "medida": "1 concha", "porcaoG": 100, "kcal": 325.84, "carb": 62.93, "prot": 17.27, "gord": 1.17, "fibra": 24.01, "sodio": 13.65, "apto": true, "fonte": "TACO", "tags": ["legume"]}, {"id": "TACO_0571", "nome": "Feijão rosinha cozido", "categoria": "Leguminosas", "medida": "1 concha", "porcaoG": 100, "kcal": 67.87, "carb": 11.82, "prot": 4.54, "gord": 0.48, "fibra": 4.76, "sodio": 2.08, "apto": true, "fonte": "TACO", "tags": ["legume"]}, {"id": "TACO_0572", "nome": "Feijão rosinha cru", "categoria": "Leguminosas", "medida": "1 concha", "porcaoG": 100, "kcal": 336.96, "carb": 62.22, "prot": 20.92, "gord": 1.33, "fibra": 20.63, "sodio": 24.11, "apto": true, "fonte": "TACO", "tags": ["legume"]}, {"id": "TACO_0573", "nome": "Feijão roxo cozido", "categoria": "Leguminosas", "medida": "1 concha", "porcaoG": 100, "kcal": 76.89, "carb": 12.91, "prot": 5.72, "gord": 0.54, "fibra": 11.51, "sodio": 1.46, "apto": true, "fonte": "TACO", "tags": ["legume"]}, {"id": "TACO_0574", "nome": "Feijão roxo cru", "categoria": "Leguminosas", "medida": "1 concha", "porcaoG": 100, "kcal": 331.41, "carb": 59.99, "prot": 22.17, "gord": 1.24, "fibra": 33.84, "sodio": 9.76, "apto": true, "fonte": "TACO", "tags": ["legume"]}, {"id": "TACO_0575", "nome": "Grão-de-bico cru", "categoria": "Leguminosas", "medida": "1 concha", "porcaoG": 100, "kcal": 354.7, "carb": 57.88, "prot": 21.23, "gord": 5.43, "fibra": 12.36, "sodio": 5.19, "apto": true, "fonte": "TACO", "tags": ["legume"]}, {"id": "TACO_0576", "nome": "Guandu cru", "categoria": "Leguminosas e derivados", "medida": "1 porção", "porcaoG": 100, "kcal": 344.13, "carb": 64.0, "prot": 18.96, "gord": 2.13, "fibra": 21.31, "sodio": 1.62, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0577", "nome": "Lentilha cozida", "categoria": "Leguminosas", "medida": "1 concha", "porcaoG": 100, "kcal": 92.64, "carb": 16.3, "prot": 6.31, "gord": 0.52, "fibra": 7.86, "sodio": 1.18, "apto": true, "fonte": "TACO", "tags": ["legume"]}, {"id": "TACO_0578", "nome": "Lentilha crua", "categoria": "Leguminosas", "medida": "1 concha", "porcaoG": 100, "kcal": 339.14, "carb": 62.0, "prot": 23.15, "gord": 0.77, "fibra": 16.94, "sodio": 0.0, "apto": true, "fonte": "TACO", "tags": ["legume"]}, {"id": "TACO_0579", "nome": "Paçoca amendoim", "categoria": "Oleaginosas", "medida": "1 porção", "porcaoG": 100, "kcal": 486.93, "carb": 52.38, "prot": 16.0, "gord": 26.08, "fibra": 7.32, "sodio": 166.84, "apto": true, "fonte": "TACO", "tags": ["sweet", "nuts_seeds"]}, {"id": "TACO_0580", "nome": "Pé-de-moleque amendoim", "categoria": "Oleaginosas", "medida": "1 porção", "porcaoG": 100, "kcal": 503.19, "carb": 54.73, "prot": 13.16, "gord": 28.05, "fibra": 3.39, "sodio": 16.35, "apto": true, "fonte": "TACO", "tags": ["nuts_seeds"]}, {"id": "TACO_0581", "nome": "Soja farinha", "categoria": "Leguminosas", "medida": "1 concha", "porcaoG": 100, "kcal": 403.96, "carb": 38.44, "prot": 36.03, "gord": 14.63, "fibra": 20.18, "sodio": 5.75, "apto": true, "fonte": "TACO", "tags": ["legume"]}, {"id": "TACO_0582", "nome": "Soja extrato solúvel natural fluido", "categoria": "Leguminosas", "medida": "1 concha", "porcaoG": 100, "kcal": 39.1, "carb": 4.28, "prot": 2.38, "gord": 1.61, "fibra": 0.37, "sodio": 56.53, "apto": true, "fonte": "TACO", "tags": ["legume"]}, {"id": "TACO_0583", "nome": "Soja extrato solúvel pó", "categoria": "Leguminosas", "medida": "1 concha", "porcaoG": 100, "kcal": 458.9, "carb": 28.48, "prot": 35.69, "gord": 26.18, "fibra": 7.31, "sodio": 83.47, "apto": true, "fonte": "TACO", "tags": ["legume"]}, {"id": "TACO_0584", "nome": "Soja queijo (tofu)", "categoria": "Leguminosas", "medida": "1 concha", "porcaoG": 100, "kcal": 64.49, "carb": 2.13, "prot": 6.55, "gord": 3.95, "fibra": 0.75, "sodio": 1.21, "apto": true, "fonte": "TACO", "tags": ["legume", "dairy"]}, {"id": "TACO_0585", "nome": "Tremoço cru", "categoria": "Leguminosas", "medida": "1 concha", "porcaoG": 100, "kcal": 381.28, "carb": 43.79, "prot": 33.58, "gord": 10.34, "fibra": 32.31, "sodio": 3.29, "apto": true, "fonte": "TACO", "tags": ["legume"]}, {"id": "TACO_0586", "nome": "Tremoço em conserva", "categoria": "Leguminosas", "medida": "1 concha", "porcaoG": 100, "kcal": 120.64, "carb": 12.39, "prot": 11.11, "gord": 3.78, "fibra": 14.44, "sodio": 1808.76, "apto": true, "fonte": "TACO", "tags": ["legume"]}, {"id": "TACO_0587", "nome": "Amêndoa torrada salgada", "categoria": "Pães", "medida": "1 fatia", "porcaoG": 100, "kcal": 580.75, "carb": 29.55, "prot": 18.55, "gord": 47.32, "fibra": 11.64, "sodio": 278.52, "apto": true, "fonte": "TACO", "tags": ["nuts_seeds"]}, {"id": "TACO_0588", "nome": "Castanha-de-caju torrada salgada", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 570.17, "carb": 29.13, "prot": 18.51, "gord": 46.28, "fibra": 3.66, "sodio": 125.0, "apto": true, "fonte": "TACO", "tags": ["fruit", "nuts_seeds"]}, {"id": "TACO_0589", "nome": "Castanha-do-Brasil crua", "categoria": "Oleaginosas", "medida": "1 porção", "porcaoG": 100, "kcal": 642.96, "carb": 15.08, "prot": 14.54, "gord": 63.46, "fibra": 7.93, "sodio": 0.65, "apto": true, "fonte": "TACO", "tags": ["nuts_seeds"]}, {"id": "TACO_0590", "nome": "Coco cru", "categoria": "Frutas", "medida": "1 unidade", "porcaoG": 100, "kcal": 406.49, "carb": 10.4, "prot": 3.69, "gord": 41.98, "fibra": 5.38, "sodio": 15.32, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0592", "nome": "Farinha de mesocarpo de babaçu crua", "categoria": "Cereais", "medida": "4 colheres de sopa", "porcaoG": 100, "kcal": 328.77, "carb": 79.17, "prot": 1.41, "gord": 0.2, "fibra": 17.86, "sodio": 12.46, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0593", "nome": "Gergelim semente", "categoria": "Oleaginosas", "medida": "1 porção", "porcaoG": 100, "kcal": 583.55, "carb": 21.62, "prot": 21.16, "gord": 50.43, "fibra": 11.87, "sodio": 2.57, "apto": true, "fonte": "TACO", "tags": ["nuts_seeds"]}, {"id": "TACO_0594", "nome": "Linhaça semente", "categoria": "Oleaginosas", "medida": "1 porção", "porcaoG": 100, "kcal": 495.1, "carb": 43.31, "prot": 14.08, "gord": 32.25, "fibra": 33.5, "sodio": 8.67, "apto": true, "fonte": "TACO", "tags": ["nuts_seeds"]}, {"id": "TACO_0595", "nome": "Pinhão cozido", "categoria": "Nozes e sementes", "medida": "1 porção", "porcaoG": 100, "kcal": 174.37, "carb": 43.92, "prot": 2.98, "gord": 0.75, "fibra": 15.6, "sodio": 0.86, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0596", "nome": "Pupunha cozida", "categoria": "Nozes e sementes", "medida": "1 porção", "porcaoG": 100, "kcal": 218.53, "carb": 29.57, "prot": 2.52, "gord": 12.76, "fibra": 4.25, "sodio": 0.91, "apto": true, "fonte": "TACO", "tags": []}, {"id": "TACO_0597", "nome": "Noz crua", "categoria": "Oleaginosas", "medida": "1 porção", "porcaoG": 100, "kcal": 620.06, "carb": 18.36, "prot": 13.97, "gord": 59.36, "fibra": 7.25, "sodio": 4.57, "apto": true, "fonte": "TACO", "tags": ["nuts_seeds"]}];
/* Nomes já vêm simplificados do gerador do banco (sem vírgulas). */

const CATEGORIES = [...new Set(FOOD_DB.map(f => f.categoria))].sort();

const REC_BANK = {"BALANCED_MEAL": ["Sua refeição ficou bem distribuída entre diferentes grupos alimentares. Você pode usar essa estrutura como referência para outras refeições.", "Sua refeição ficou bem distribuída entre diferentes grupos alimentares. Manter variedade ao longo da semana ajuda a evitar monotonia.", "Sua refeição ficou bem distribuída entre diferentes grupos alimentares. Continue observando também as porções e o contexto da glicemia.", "Sua refeição ficou bem distribuída entre diferentes grupos alimentares. Uma refeição equilibrada não precisa ser complicada.", "Sua refeição ficou bem distribuída entre diferentes grupos alimentares. Vale repetir a combinação de vegetais, proteína e carboidrato de qualidade.", "Sua refeição ficou bem distribuída entre diferentes grupos alimentares. A variedade do prato é um ponto positivo.", "Sua refeição ficou bem distribuída entre diferentes grupos alimentares. Esse padrão facilita uma alimentação mais completa.", "Sua refeição ficou bem distribuída entre diferentes grupos alimentares. Use o histórico para comparar refeições parecidas."], "NO_VEGETABLE": ["Não apareceu nenhuma hortaliça nesta refeição. Se estiver disponível, acrescente folhas, tomate, brócolis, couve, abobrinha ou outro vegetal que você goste.", "Não apareceu nenhuma hortaliça nesta refeição. Uma pequena porção de legumes já aumenta a variedade do prato.", "Não apareceu nenhuma hortaliça nesta refeição. Tente escolher um vegetal simples que caiba na sua rotina.", "Não apareceu nenhuma hortaliça nesta refeição. Você não precisa mudar a refeição inteira; acrescentar um vegetal já é um começo.", "Não apareceu nenhuma hortaliça nesta refeição. Varie as cores dos vegetais quando puder.", "Não apareceu nenhuma hortaliça nesta refeição. Verduras e legumes podem entrar crus, cozidos, assados ou refogados.", "Não apareceu nenhuma hortaliça nesta refeição. Se mastigar vegetais crus for difícil, versões cozidas podem ser mais confortáveis.", "Não apareceu nenhuma hortaliça nesta refeição. O objetivo é aumentar variedade, não criar uma lista de alimentos proibidos."], "NO_PROTEIN_SOURCE": ["Não foi identificada uma fonte clara de proteína nesta refeição. Dependendo da refeição, você pode considerar ovo, peixe, frango, carne fresca, feijão, lentilha ou iogurte.", "Não foi identificada uma fonte clara de proteína nesta refeição. Uma fonte de proteína pode deixar a refeição mais completa.", "Não foi identificada uma fonte clara de proteína nesta refeição. Escolha uma opção que combine com sua rotina e preferências.", "Não foi identificada uma fonte clara de proteína nesta refeição. Leguminosas também contribuem com proteína e fibras.", "Não foi identificada uma fonte clara de proteína nesta refeição. Não é necessário acrescentar grandes quantidades; a composição geral importa.", "Não foi identificada uma fonte clara de proteína nesta refeição. Em lanches, iogurte ou outras opções simples podem ajudar.", "Não foi identificada uma fonte clara de proteína nesta refeição. Evite transformar essa sugestão em uma regra rígida para todas as refeições.", "Não foi identificada uma fonte clara de proteína nesta refeição. Se houver orientação nutricional individual, ela deve ter prioridade."], "NO_LEGUME": ["Nenhuma leguminosa foi registrada nesta refeição principal. Se fizer parte da sua rotina, feijão, lentilha, ervilha ou grão-de-bico podem aumentar fibras e variedade.", "Nenhuma leguminosa foi registrada nesta refeição principal. Arroz com feijão continua sendo uma combinação prática e culturalmente familiar.", "Nenhuma leguminosa foi registrada nesta refeição principal. Você pode variar as leguminosas ao longo da semana.", "Nenhuma leguminosa foi registrada nesta refeição principal. Uma porção de feijão ou lentilha pode complementar cereais e vegetais.", "Nenhuma leguminosa foi registrada nesta refeição principal. Não é obrigatório usar a mesma leguminosa todos os dias.", "Nenhuma leguminosa foi registrada nesta refeição principal. Experimente preparações simples para facilitar a rotina.", "Nenhuma leguminosa foi registrada nesta refeição principal. Se houver desconforto gastrointestinal, aumentos de fibras podem ser graduais.", "Nenhuma leguminosa foi registrada nesta refeição principal. Considere as preferências e tolerâncias individuais."], "LOW_FIBER": ["A refeição parece ter poucas fontes de fibra. Você pode incluir feijão, lentilha, verduras, frutas inteiras, aveia ou grãos integrais.", "A refeição parece ter poucas fontes de fibra. Trocar uma parte dos refinados por opções integrais pode aumentar as fibras.", "A refeição parece ter poucas fontes de fibra. Uma fruta inteira pode ser uma alternativa simples para aumentar fibras.", "A refeição parece ter poucas fontes de fibra. Vegetais e leguminosas são formas práticas de enriquecer a refeição.", "A refeição parece ter poucas fontes de fibra. Aumentos de fibra podem ser graduais, principalmente em quem não está acostumado.", "A refeição parece ter poucas fontes de fibra. Prefira melhorar a qualidade da refeição em vez de retirar todos os carboidratos.", "A refeição parece ter poucas fontes de fibra. O banco deve mostrar quantos gramas de fibra foram registrados, sem inventar metas individuais.", "A refeição parece ter poucas fontes de fibra. Se houver restrição alimentar específica, siga a orientação profissional."], "FIBER_RICH": ["Foram identificadas boas fontes de fibra na refeição. Continue variando entre verduras, frutas inteiras, feijões e grãos integrais.", "Foram identificadas boas fontes de fibra na refeição. A variedade das fontes de fibra também importa.", "Foram identificadas boas fontes de fibra na refeição. Esse é um ponto positivo da composição do prato.", "Foram identificadas boas fontes de fibra na refeição. Use o histórico para descobrir combinações que funcionam bem para você.", "Foram identificadas boas fontes de fibra na refeição. Manter alimentos minimamente processados ajuda a preservar a qualidade da alimentação.", "Foram identificadas boas fontes de fibra na refeição. Evite transformar um único nutriente em medida de 'refeição perfeita'; observe o conjunto.", "Foram identificadas boas fontes de fibra na refeição. Uma boa presença de fibras pode ser mantida com alimentos simples do dia a dia.", "Foram identificadas boas fontes de fibra na refeição. Compare com refeições anteriores para ver se esse padrão está ficando mais frequente."], "REFINED_CARB_DOMINANT": ["A refeição concentrou carboidratos refinados e poucas fontes de fibra. Você pode trocar parte por opções integrais ou combinar com feijão e vegetais.", "A refeição concentrou carboidratos refinados e poucas fontes de fibra. Não é necessário excluir todo carboidrato; melhorar a qualidade já é útil.", "A refeição concentrou carboidratos refinados e poucas fontes de fibra. Aveia, arroz integral, pão integral e leguminosas são algumas possibilidades.", "A refeição concentrou carboidratos refinados e poucas fontes de fibra. A quantidade e a qualidade do carboidrato devem ser observadas juntas.", "A refeição concentrou carboidratos refinados e poucas fontes de fibra. Experimente uma mudança pequena, como acrescentar feijão ou vegetais.", "A refeição concentrou carboidratos refinados e poucas fontes de fibra. Se preferir manter o alimento refinado, equilibrar a composição da refeição já pode ser uma estratégia.", "A refeição concentrou carboidratos refinados e poucas fontes de fibra. Observe também a quantidade realmente consumida, não apenas o nome do alimento.", "A refeição concentrou carboidratos refinados e poucas fontes de fibra. Use os registros de glicemia real para comparar refeições semelhantes."], "SUGARY_DRINK": ["Foi registrada uma bebida açucarada. Água é a principal opção para hidratação.", "Foi registrada uma bebida açucarada. Trocar a bebida açucarada por água pode reduzir carboidratos adicionados à refeição.", "Foi registrada uma bebida açucarada. Você pode começar diminuindo a frequência em vez de mudar tudo de uma vez.", "Foi registrada uma bebida açucarada. Se quiser uma alternativa sem açúcar, verifique se ela se encaixa nas suas preferências.", "Foi registrada uma bebida açucarada. Bebidas açucaradas podem adicionar carboidratos rapidamente.", "Foi registrada uma bebida açucarada. Experimente deixar água visível e fácil de alcançar.", "Foi registrada uma bebida açucarada. A sugestão deve ser de troca, não de culpa ou proibição.", "Foi registrada uma bebida açucarada. Registre a porção da bebida para o cálculo ficar correto."], "JUICE_PRESENT": ["Foi registrado suco de fruta nesta refeição. Em algumas ocasiões, a fruta inteira pode ser uma opção com mais fibra.", "Foi registrado suco de fruta nesta refeição. Compare a porção do suco com a quantidade de carboidratos registrada.", "Foi registrado suco de fruta nesta refeição. Você pode alternar entre suco e fruta inteira ao longo da semana.", "Foi registrado suco de fruta nesta refeição. Fruta inteira costuma preservar mais da estrutura e das fibras do alimento.", "Foi registrado suco de fruta nesta refeição. Não é necessário tratar suco como proibido; a quantidade e o contexto importam.", "Foi registrado suco de fruta nesta refeição. Se a intenção for apenas hidratação, água pode ser a opção principal.", "Foi registrado suco de fruta nesta refeição. Evite adicionar açúcar ao suco quando não for necessário.", "Foi registrado suco de fruta nesta refeição. O aplicativo deve diferenciar suco natural, néctar e bebida açucarada."], "ULTRAPROCESSED_MULTIPLE": ["Foram registrados vários alimentos ultraprocessados na mesma refeição. Tente substituir apenas um deles por uma opção in natura ou minimamente processada.", "Foram registrados vários alimentos ultraprocessados na mesma refeição. Uma mudança pequena pode ser mais fácil de manter do que trocar tudo de uma vez.", "Foram registrados vários alimentos ultraprocessados na mesma refeição. Frutas, legumes, feijões, ovos e preparações caseiras são alternativas possíveis.", "Foram registrados vários alimentos ultraprocessados na mesma refeição. Observe principalmente a frequência desse padrão ao longo da semana.", "Foram registrados vários alimentos ultraprocessados na mesma refeição. O Guia Alimentar brasileiro prioriza alimentos in natura e minimamente processados.", "Foram registrados vários alimentos ultraprocessados na mesma refeição. Evite classificar a pessoa como 'certa' ou 'errada' pela refeição.", "Foram registrados vários alimentos ultraprocessados na mesma refeição. Use o histórico para mostrar se os ultraprocessados estão ficando mais ou menos frequentes.", "Foram registrados vários alimentos ultraprocessados na mesma refeição. Sugira opções compatíveis com a cultura e a rotina do usuário."], "WATER_LOW": ["Seu registro de água está abaixo da meta definida no aplicativo. Se não houver restrição de líquidos, tente distribuir pequenas quantidades ao longo do dia.", "Seu registro de água está abaixo da meta definida no aplicativo. Deixar uma garrafa por perto pode facilitar a rotina.", "Seu registro de água está abaixo da meta definida no aplicativo. Você pode registrar um copo de cada vez.", "Seu registro de água está abaixo da meta definida no aplicativo. Evite tentar compensar tudo de uma vez no fim do dia.", "Seu registro de água está abaixo da meta definida no aplicativo. A meta precisa ser individual e não deve ser inventada pelo aplicativo.", "Seu registro de água está abaixo da meta definida no aplicativo. Se houver doença renal, cardíaca ou restrição de líquidos, siga a orientação profissional.", "Seu registro de água está abaixo da meta definida no aplicativo. Use lembretes apenas se forem úteis para você.", "Seu registro de água está abaixo da meta definida no aplicativo. O histórico pode mostrar quais horários costumam ter menos registros."], "WATER_GOAL": ["A meta de hidratação cadastrada foi atingida. Continue registrando para acompanhar a regularidade.", "A meta de hidratação cadastrada foi atingida. Distribuir a hidratação ao longo do dia pode facilitar a rotina.", "A meta de hidratação cadastrada foi atingida. Bom acompanhamento do registro de água.", "A meta de hidratação cadastrada foi atingida. Use o histórico para perceber em quais dias a hidratação fica mais fácil.", "A meta de hidratação cadastrada foi atingida. A meta cadastrada continua tendo prioridade sobre recomendações genéricas.", "A meta de hidratação cadastrada foi atingida. Se houver orientação médica de restrição de líquidos, ela deve prevalecer.", "A meta de hidratação cadastrada foi atingida. Você pode manter o mesmo padrão amanhã se ele funcionar para sua rotina.", "A meta de hidratação cadastrada foi atingida. O objetivo é consistência, não perfeição."], "NO_WATER_LOGS": ["Ainda não há registro de água hoje. Se você já bebeu água, registre para o histórico ficar completo.", "Ainda não há registro de água hoje. Se não houver restrição de líquidos, lembre-se de hidratar-se ao longo do dia.", "Ainda não há registro de água hoje. Um registro simples já ajuda o aplicativo a acompanhar sua rotina.", "Ainda não há registro de água hoje. Não significa necessariamente que você não bebeu água; pode ser apenas falta de registro.", "Ainda não há registro de água hoje. O GlyControl deve diferenciar ausência de consumo de ausência de registro.", "Ainda não há registro de água hoje. Você pode adicionar a quantidade aproximada em ml ou copos.", "Ainda não há registro de água hoje. Evite alertas insistentes se o usuário preferir desativá-los.", "Ainda não há registro de água hoje. A recomendação deve ser curta e fácil de entender."], "GLUCOSE_IN_PERSONAL_TARGET": ["Esta medição ficou dentro da sua meta cadastrada. Continue registrando o contexto da medição.", "Esta medição ficou dentro da sua meta cadastrada. Um único valor é útil, mas o padrão ao longo dos dias é ainda mais informativo.", "Esta medição ficou dentro da sua meta cadastrada. Registre se foi em jejum, antes ou depois da refeição.", "Esta medição ficou dentro da sua meta cadastrada. Use o histórico para comparar situações semelhantes.", "Esta medição ficou dentro da sua meta cadastrada. Não é necessário mudar a alimentação com base apenas neste registro.", "Esta medição ficou dentro da sua meta cadastrada. Bom registro; manter a consistência ajuda a enxergar tendências.", "Esta medição ficou dentro da sua meta cadastrada. Compare também com refeições e horários semelhantes.", "Esta medição ficou dentro da sua meta cadastrada. A meta usada pelo aplicativo deve ser a meta individual cadastrada."], "SINGLE_ABOVE_PERSONAL_TARGET": ["Esta medição ficou acima da sua meta cadastrada. Uma leitura isolada não explica a causa; registre o contexto e observe se o padrão se repete.", "Esta medição ficou acima da sua meta cadastrada. Anote se foi em jejum, antes ou depois de comer.", "Esta medição ficou acima da sua meta cadastrada. Compare com outros dias no mesmo horário.", "Esta medição ficou acima da sua meta cadastrada. Não altere medicamento por conta própria com base apenas neste valor.", "Esta medição ficou acima da sua meta cadastrada. Refeição, atividade, estresse, doença e outros fatores podem participar do resultado.", "Esta medição ficou acima da sua meta cadastrada. O aplicativo deve mostrar a medição sem culpabilizar o usuário.", "Esta medição ficou acima da sua meta cadastrada. Se valores semelhantes se repetirem, o histórico pode ser levado ao profissional de saúde.", "Esta medição ficou acima da sua meta cadastrada. Evite afirmar que um alimento específico causou esse valor."], "REPEATED_ABOVE_PERSONAL_TARGET": ["O histórico identificou repetição de valores acima da meta cadastrada. Leve esse padrão ao profissional de saúde que acompanha você.", "O histórico identificou repetição de valores acima da meta cadastrada. Compare os horários e contextos em que isso acontece.", "O histórico identificou repetição de valores acima da meta cadastrada. O relatório pode ajudar a mostrar refeições e medições relacionadas.", "O histórico identificou repetição de valores acima da meta cadastrada. Não ajuste medicamento ou insulina por conta própria.", "O histórico identificou repetição de valores acima da meta cadastrada. O GlyControl deve destacar a repetição, não inventar uma causa.", "O histórico identificou repetição de valores acima da meta cadastrada. Se houver refeições semelhantes antes desses registros, elas podem ser comparadas de forma retrospectiva.", "O histórico identificou repetição de valores acima da meta cadastrada. Mostre quantas vezes o padrão ocorreu e em qual período.", "O histórico identificou repetição de valores acima da meta cadastrada. Use linguagem simples e destaque que a avaliação é individual."], "HYPO_LT70": ["Atenção: este registro está na faixa de hipoglicemia. Se você estiver consciente e conseguir engolir, siga seu plano de tratamento para hipoglicemia; a ADA orienta 15 g de carboidrato de ação rápida e nova checagem após 15 minutos.", "Atenção: este registro está na faixa de hipoglicemia. Não espere apenas pela próxima refeição; siga imediatamente a orientação individual para glicemia baixa.", "Atenção: este registro está na faixa de hipoglicemia. Depois do tratamento, faça nova medição conforme orientação e registre o resultado.", "Atenção: este registro está na faixa de hipoglicemia. Se continuar abaixo de 70 mg/dL, siga novamente o plano de hipoglicemia indicado.", "Atenção: este registro está na faixa de hipoglicemia. O aplicativo deve interromper recomendações alimentares comuns enquanto a glicemia estiver baixa.", "Atenção: este registro está na faixa de hipoglicemia. Se você não souber como tratar hipoglicemia, procure orientação de saúde.", "Atenção: este registro está na faixa de hipoglicemia. Evite alimentos muito gordurosos como primeira opção de correção rápida porque podem retardar a absorção.", "Atenção: este registro está na faixa de hipoglicemia. Se houver piora dos sintomas, procure ajuda."], "LOGGING_CONSISTENT": ["Seus registros estão ficando consistentes. Isso ajuda a enxergar padrões com mais clareza.", "Seus registros estão ficando consistentes. Continue registrando apenas o que for útil, sem transformar o aplicativo em obrigação excessiva.", "Seus registros estão ficando consistentes. A consistência é mais importante que preencher tudo perfeitamente.", "Seus registros estão ficando consistentes. Um histórico bem organizado pode facilitar consultas com profissionais.", "Seus registros estão ficando consistentes. Você pode usar os relatórios semanais para revisar tendências.", "Seus registros estão ficando consistentes. Manter horários e contextos completos melhora a comparação.", "Seus registros estão ficando consistentes. O aplicativo deve valorizar o esforço sem cobrar perfeição.", "Seus registros estão ficando consistentes. Se os registros estiverem cansativos, simplifique os campos opcionais."], "LOGGING_GAPS": ["Ainda há poucos registros para identificar um padrão confiável. Continue registrando quando puder.", "Ainda há poucos registros para identificar um padrão confiável. O aplicativo não deve tirar conclusões fortes com poucos dados.", "Ainda há poucos registros para identificar um padrão confiável. Alguns dias completos já ajudam mais do que muitos registros isolados.", "Ainda há poucos registros para identificar um padrão confiável. Tente registrar refeição e glicemia relacionadas quando isso fizer parte do seu plano de acompanhamento.", "Ainda há poucos registros para identificar um padrão confiável. Evite mensagens que deem a impressão de diagnóstico.", "Ainda há poucos registros para identificar um padrão confiável. O sistema pode mostrar 'dados insuficientes' de forma simples.", "Ainda há poucos registros para identificar um padrão confiável. Não preencha dados ausentes automaticamente.", "Ainda há poucos registros para identificar um padrão confiável. Quanto melhor o histórico, mais personalizada pode ser a recomendação."], "FRUIT_WHOLE_PRESENT": ["Uma fruta inteira foi registrada. Boa forma de incluir variedade e fibras na alimentação.", "Uma fruta inteira foi registrada. Varie os tipos de fruta ao longo da semana.", "Uma fruta inteira foi registrada. A fruta continua entrando na contagem de carboidratos.", "Uma fruta inteira foi registrada. Não use 'natural' como sinônimo de 'sem carboidrato'.", "Uma fruta inteira foi registrada. Escolha frutas que sejam fáceis de consumir na sua rotina.", "Uma fruta inteira foi registrada. Não é necessário evitar frutas apenas por terem açúcar natural.", "Uma fruta inteira foi registrada. A porção deve ser registrada para o cálculo ficar correto.", "Uma fruta inteira foi registrada. Se houver dificuldade de mastigação, adapte a textura conforme orientação."], "LEGUME_PRESENT": ["Uma leguminosa foi incluída na refeição. Ela contribui com fibras e proteína vegetal.", "Uma leguminosa foi incluída na refeição. Você pode variar o tipo ao longo da semana.", "Uma leguminosa foi incluída na refeição. Feijões combinam bem com cereais e vegetais.", "Uma leguminosa foi incluída na refeição. O aplicativo deve contar os carboidratos da porção normalmente.", "Uma leguminosa foi incluída na refeição. Não trate leguminosa como 'carboidrato proibido'.", "Uma leguminosa foi incluída na refeição. Preparações caseiras simples podem facilitar o uso frequente.", "Uma leguminosa foi incluída na refeição. Observe o sódio quando a versão for enlatada.", "Uma leguminosa foi incluída na refeição. Se houver desconforto gastrointestinal, mudanças podem ser graduais."], "WHOLE_GRAIN_PRESENT": ["Uma opção integral foi registrada. Ela pode contribuir com fibras e variedade.", "Uma opção integral foi registrada. Continue alternando com outros alimentos minimamente processados.", "Uma opção integral foi registrada. Integral não significa 'sem carboidrato'; a porção continua importante.", "Uma opção integral foi registrada. Compare rótulos quando houver marcas diferentes.", "Uma opção integral foi registrada. O aplicativo deve evitar chamar todo produto 'integral' de saudável sem verificar composição.", "Uma opção integral foi registrada. Arroz integral, aveia e outros grãos podem entrar de formas diferentes na rotina.", "Uma opção integral foi registrada. Não é necessário substituir todas as versões refinadas.", "Uma opção integral foi registrada. Observe qual opção você prefere e consegue manter."], "NUTS_PRESENT": ["Oleaginosas foram incluídas na alimentação. Elas podem contribuir com gorduras insaturadas e variedade.", "Oleaginosas foram incluídas na alimentação. Como são concentradas em energia, a quantidade registrada continua importante.", "Oleaginosas foram incluídas na alimentação. Varie entre castanhas, amendoim e nozes conforme tolerância e alergias.", "Oleaginosas foram incluídas na alimentação. Não use se houver alergia cadastrada.", "Oleaginosas foram incluídas na alimentação. Prefira versões sem excesso de sal quando possível.", "Oleaginosas foram incluídas na alimentação. O aplicativo deve calcular a porção real.", "Oleaginosas foram incluídas na alimentação. Uma pequena quantidade pode complementar lanches.", "Oleaginosas foram incluídas na alimentação. Evite recomendar para quem tem dificuldade importante de mastigação sem adaptação de textura."]};
const TROCAS_ALIMENTARES = {"Carboidratos refinados": ["arroz integral", "aveia", "pão integral", "feijão", "lentilha", "grão-de-bico", "quinoa", "batata-doce com vegetais"], "Bebidas açucaradas": ["água", "água com gás", "café sem açúcar", "chá sem açúcar", "bebida sem açúcar quando apropriado"], "Embutidos": ["ovo", "frango", "peixe", "carne fresca", "feijão", "lentilha", "grão-de-bico"], "Lanches ultraprocessados": ["fruta inteira", "iogurte natural", "aveia", "pão integral", "ovo", "oleaginosas se não houver alergia/dificuldade de mastigação"], "Doces/sobremesas": ["fruta inteira", "iogurte natural com fruta", "porção menor da sobremesa", "sobremesa menos frequente"], "Pouca fibra": ["feijão", "lentilha", "aveia", "fruta inteira", "verduras", "legumes", "grãos integrais"], "Poucos vegetais": ["alface", "tomate", "cenoura", "abobrinha", "brócolis", "couve", "chuchu", "berinjela", "vagem"], "Pouca proteína": ["ovo", "frango", "peixe", "carne fresca", "feijão", "lentilha", "iogurte natural"], "Muito sódio": ["preparação caseira", "ervas", "alho", "cebola", "limão", "reduzir embutidos", "reduzir temperos prontos"], "Frituras frequentes": ["assado", "cozido", "grelhado", "refogado"]};

/* Marcadores de estabilidade para saber se um alimento tem determinada
   tag (usado pelo motor de recomendações determinístico). */
function temTag(alimento, tag) {
  return !!(alimento && alimento.tags && alimento.tags.includes(tag));
}
function refeicaoTemTag(itens, tag) {
  return (itens || []).some(it => {
    const alimento = FOOD_DB.find(f => f.id === it.alimentoId);
    return temTag(alimento, tag);
  });
}
function contarTagNaRefeicao(itens, tag) {
  return (itens || []).filter(it => {
    const alimento = FOOD_DB.find(f => f.id === it.alimentoId);
    return temTag(alimento, tag);
  }).length;
}

/* Escolhe uma variação de texto para o gatilho — implementada mais
   abaixo, próximo ao motor de recomendações (escolherVariacaoRec). */
const LOGO_DATA_URI = "data:image/png;base64,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";



/* ---------------------- CONSTANTES DO DOMÍNIO ---------------------- */

const CONTEXTOS_GLICEMIA = [
  "Jejum", "Antes do café da manhã", "Depois do café da manhã",
  "Antes do almoço", "Depois do almoço", "Antes do jantar",
  "Depois do jantar", "Antes de dormir", "Outro"
];

const TIPOS_REFEICAO = [
  "Café da manhã", "Lanche da manhã", "Almoço", "Lanche da tarde",
  "Jantar", "Ceia", "Outra refeição"
];

/* Critérios clínicos de classificação — EDUCATIVOS, configuráveis.
   Não substituem orientação médica. Baseado no protótipo (slide 3). */
const DEFAULT_GLI_RANGES = {
  perigosoBaixo: 69,   // <= 69 mg/dL
  atencaoBaixo: 79,    // 70-79 mg/dL
  adequadoMin: 80,      // 80-130 mg/dL
  adequadoMax: 130,
  atencaoAltoMax: 180, // 131-180 mg/dL
  // >= 181 mg/dL = perigoso
};

/* Meta glicêmica individualizada: cada usuário pode ajustar sua
   própria faixa "adequada" no Perfil (padrão: 80-130 mg/dL, igual ao
   protótipo). As faixas de atenção/perigo são recalculadas a partir
   dela, mantendo a mesma folga do padrão. Nunca aplicamos a mesma
   meta rígida para todos — ver Perfil > Meta de glicemia. */
function getRangesDoUsuario(perfil) {
  const min = Number(perfil?.metaGlicemiaMin) || DEFAULT_GLI_RANGES.adequadoMin;
  const max = Number(perfil?.metaGlicemiaMax) || DEFAULT_GLI_RANGES.adequadoMax;
  return {
    perigosoBaixo: Math.max(0, min - 11),
    atencaoBaixo: min - 1,
    adequadoMin: min,
    adequadoMax: max,
    atencaoAltoMax: max + 50,
  };
}

function classificarGlicemia(valor, ranges = DEFAULT_GLI_RANGES) {
  const v = Number(valor);
  if (Number.isNaN(v)) return { label: "—", color: "#9CA3AF", bg: "#F3F4F6" };
  if (v <= ranges.perigosoBaixo || v >= ranges.atencaoAltoMax + 1) {
    return { label: "Perigoso", color: "#C0392B", bg: "#FBE7E5" };
  }
  if ((v > ranges.perigosoBaixo && v <= ranges.atencaoBaixo) ||
      (v > ranges.adequadoMax && v <= ranges.atencaoAltoMax)) {
    return { label: "Atenção", color: "#D4A017", bg: "#FBF3DA" };
  }
  if (v >= ranges.adequadoMin && v <= ranges.adequadoMax) {
    return { label: "Adequado", color: "#2C6E49", bg: "#E4F1E8" };
  }
  return { label: "Atenção", color: "#D4A017", bg: "#FBF3DA" };
}

const COLORS = {
  primary: "#1F5C3E",
  primaryDark: "#154430",
  primaryLight: "#E4F1E8",
  bg: "#F6F5EF",
  card: "#FFFFFF",
  text: "#1D2B22",
  textMuted: "#5B6B60",
  border: "#E1E4DC",
  blue: "#3A6EA5",
  blueBg: "#E7EEF6",
  purple: "#6C3FA0",
  purpleBg: "#EFE6F6",
  danger: "#C0392B",
  dangerBg: "#FBE7E5",
  warn: "#D4A017",
  warnBg: "#FBF3DA",
};

/* ---------------------- UTILITÁRIOS ---------------------- */

function uid(prefix = "id") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function nowISO() {
  return new Date().toISOString();
}

function fmtData(iso) {
  if (!iso) return "--/--/----";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "--/--/----";
  return d.toLocaleDateString("pt-BR");
}

function fmtHora(iso) {
  if (!iso) return "--:--";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "--:--";
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function fmtDataHora(iso) {
  return `${fmtData(iso)} às ${fmtHora(iso)}`;
}

function round1(n) {
  return Math.round((Number(n) || 0) * 10) / 10;
}

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function isSameDay(a, b) {
  const da = new Date(a), db = new Date(b);
  return da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() && da.getDate() === db.getDate();
}

function withinDays(iso, days) {
  const d = new Date(iso).getTime();
  const now = Date.now();
  const cutoff = now - days * 24 * 60 * 60 * 1000;
  return d >= cutoff && d <= now;
}

/* Cálculo nutricional: valor por 100g x quantidade em gramas / 100 */
function calcularNutrientePorcao(valorPor100g, quantidadeG) {
  if (valorPor100g == null) return null;
  return (Number(valorPor100g) * Number(quantidadeG)) / 100;
}

function calcularItemRefeicao(alimento, quantidadeG) {
  return {
    kcal: calcularNutrientePorcao(alimento.kcal, quantidadeG),
    carb: calcularNutrientePorcao(alimento.carb, quantidadeG),
    prot: calcularNutrientePorcao(alimento.prot, quantidadeG),
    gord: calcularNutrientePorcao(alimento.gord, quantidadeG),
    fibra: calcularNutrientePorcao(alimento.fibra, quantidadeG),
    sodio: calcularNutrientePorcao(alimento.sodio, quantidadeG),
  };
}

function somarNutrientes(itens) {
  return itens.reduce((acc, it) => {
    acc.kcal += it.kcal || 0;
    acc.carb += it.carb || 0;
    acc.prot += it.prot || 0;
    acc.gord += it.gord || 0;
    acc.fibra += it.fibra || 0;
    acc.sodio += it.sodio || 0;
    return acc;
  }, { kcal: 0, carb: 0, prot: 0, gord: 0, fibra: 0, sodio: 0 });
}

/* ============================================================
   MEDIDAS CASEIRAS
   ------------------------------------------------------------
   O idoso nunca digita gramas. Ele escolhe uma medida caseira
   (colher, concha, unidade, fatia...) e o sistema converte
   internamente para gramas usando uma referência padrão de
   medidas caseiras (prática comum em tabelas nutricionais
   brasileiras). O cálculo em si continua em gramas:
   nutriente = nutriente_por_100g × peso_da_medida / 100.
   Nunca inventamos peso para uma medida que não está nesta
   referência — nesse caso caímos para "porção" (100 g).
   ============================================================ */
const MEDIDA_UNIT_REF = {
  "colher de sopa": { pesoUnidade: 15, multiplicadores: [1, 2, 3, 4] },
  "colher de chá": { pesoUnidade: 5, multiplicadores: [1, 2, 3, 4] },
  "concha": { pesoUnidade: 90, multiplicadores: [0.5, 1, 2] },
  "unidade": { pesoUnidade: 100, multiplicadores: [0.5, 1, 2] },
  "unidade média": { pesoUnidade: 100, multiplicadores: [0.5, 1, 2] },
  "fatia": { pesoUnidade: 30, multiplicadores: [1, 2, 3] },
  "filé": { pesoUnidade: 120, multiplicadores: [0.5, 1, 2] },
  "copo": { pesoUnidade: 200, multiplicadores: [0.5, 1, 2] },
  "xícara": { pesoUnidade: 80, multiplicadores: [0.5, 1, 2] },
  "pote": { pesoUnidade: 170, multiplicadores: [0.5, 1, 2] },
  "porção": { pesoUnidade: 100, multiplicadores: [0.5, 1, 2] },
};

/* Extrai o nome da medida caseira a partir do texto salvo no
   alimento (ex.: "4 colheres de sopa" -> "colher de sopa"). */
function nomeMedidaSingular(medidaTexto) {
  const t = (medidaTexto || "").toLowerCase();
  if (t.includes("colher de sopa") || t.includes("colheres de sopa")) return "colher de sopa";
  if (t.includes("colher de chá") || t.includes("colheres de chá")) return "colher de chá";
  if (t.includes("concha")) return "concha";
  if (t.includes("unidade média")) return "unidade média";
  if (t.includes("unidade")) return "unidade";
  if (t.includes("fatia")) return "fatia";
  if (t.includes("filé")) return "filé";
  if (t.includes("xícara")) return "xícara";
  if (t.includes("copo")) return "copo";
  if (t.includes("pote")) return "pote";
  return "porção";
}

const MEDIDA_PLURAL = {
  "colher de sopa": "colheres de sopa", "colher de chá": "colheres de chá",
  "concha": "conchas", "unidade": "unidades", "unidade média": "unidades médias",
  "fatia": "fatias", "filé": "filés", "xícara": "xícaras", "copo": "copos",
  "pote": "potes", "porção": "porções",
};

function fmtFracao(n) {
  if (n === 0.5) return "1/2";
  if (n === 1.5) return "1 e 1/2";
  return String(n);
}

/* Gera as opções de quantidade em medida caseira para um alimento,
   já com o peso em gramas calculado (usado internamente pelo
   cálculo nutricional, nunca mostrado ao usuário). */
function gerarOpcoesMedida(alimento) {
  const unidade = nomeMedidaSingular(alimento.medida);
  const ref = MEDIDA_UNIT_REF[unidade] || MEDIDA_UNIT_REF["porção"];
  const plural = MEDIDA_PLURAL[unidade] || "porções";
  return ref.multiplicadores.map(m => {
    const qtdG = Math.round(ref.pesoUnidade * m);
    const rotulo = m === 1 ? `1 ${unidade}` : `${fmtFracao(m)} ${plural}`;
    return { label: rotulo, qtdG, multiplicador: m };
  });
}

function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validarSenha(senha) {
  return {
    minimo6: (senha || "").length >= 6,
    maiuscula: /[A-Z]/.test(senha || ""),
    numero: /[0-9]/.test(senha || ""),
    especial: /[^A-Za-z0-9]/.test(senha || ""),
  };
}

function senhaValida(senha) {
  const v = validarSenha(senha);
  return v.minimo6 && v.maiuscula && v.numero && v.especial;
}

/* Hash simples apenas para prototipo local (NÃO usar em produção).
   Em produção real: hashing seguro no backend (bcrypt/argon2) + HTTPS. */
function hashSimples(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return String(hash);
}

/* ---------------------- CAMADA DE PERSISTÊNCIA ----------------------
   Usa window.storage (chave-valor, persiste entre sessões no protótipo).
   Em uma versão real, substituir por chamadas a uma API REST + banco. */

async function storageGet(key, shared = false) {
  try {
    const res = await window.storage.get(key, shared);
    return res ? JSON.parse(res.value) : null;
  } catch (e) {
    return null;
  }
}

async function storageSet(key, value, shared = false) {
  try {
    await window.storage.set(key, JSON.stringify(value), shared);
    return true;
  } catch (e) {
    return false;
  }
}

function novoPerfil({ nome, email, idade, sexo }) {
  return {
    nome, email, idade: idade || "", sexo: sexo || "Não quero informar",
    criadoEm: nowISO(),
    metaAguaMl: 2000,
    fontScale: 1,
    // Meta glicêmica individualizada — cada usuário tem a sua,
    // não é a mesma faixa rígida para todo mundo. Padrão inicial
    // segue o protótipo (80-130 mg/dL) mas pode ser ajustada.
    metaGlicemiaMin: 80,
    metaGlicemiaMax: 130,
  };
}

function novoUserData(perfil) {
  return { perfil, glicemias: [], refeicoes: [], agua: [] };
}

/* ============================================================
   COMPONENTES REUTILIZÁVEIS (átomos de UI)
   ============================================================ */

function Btn({ children, onClick, variant = "primary", full = true, size = "lg", type = "button", disabled, icon: Icon, style: extraStyle }) {
  const base = {
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    fontWeight: 700, borderRadius: 14, cursor: disabled ? "not-allowed" : "pointer",
    border: "none", transition: "transform .05s ease, opacity .15s ease",
    width: full ? "100%" : "auto", opacity: disabled ? 0.55 : 1,
    fontFamily: "inherit",
  };
  const sizes = {
    lg: { padding: "16px 20px", fontSize: 18 },
    md: { padding: "12px 16px", fontSize: 16 },
    sm: { padding: "9px 14px", fontSize: 15 },
  };
  const variants = {
    primary: { background: COLORS.primary, color: "#fff" },
    blue: { background: COLORS.blue, color: "#fff" },
    purple: { background: COLORS.purple, color: "#fff" },
    danger: { background: COLORS.danger, color: "#fff" },
    outline: { background: "#fff", color: COLORS.primary, border: `2px solid ${COLORS.primary}` },
    ghost: { background: "transparent", color: COLORS.primary },
    subtle: { background: COLORS.primaryLight, color: COLORS.primaryDark },
  };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{ ...base, ...sizes[size], ...variants[variant], ...extraStyle }}
      onMouseDown={e => { if (!disabled) e.currentTarget.style.transform = "scale(0.98)"; }}
      onMouseUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
    >
      {Icon && <Icon size={20} />}
      {children}
    </button>
  );
}

function Card({ children, style, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: COLORS.card, borderRadius: 16, padding: 18,
        border: `1px solid ${COLORS.border}`, boxShadow: "0 1px 3px rgba(20,40,25,0.05)",
        cursor: onClick ? "pointer" : "default", ...style,
      }}
    >
      {children}
    </div>
  );
}

function Field({ label, children, hint, error }) {
  return (
    <div style={{ marginBottom: 16, textAlign: "left" }}>
      {label && <label style={{ display: "block", fontWeight: 700, fontSize: 15, marginBottom: 6, color: COLORS.text }}>{label}</label>}
      {children}
      {hint && !error && <div style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 4 }}>{hint}</div>}
      {error && <div style={{ fontSize: 13, color: COLORS.danger, marginTop: 4, fontWeight: 600 }}>{error}</div>}
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "14px 14px", fontSize: 17, borderRadius: 12,
  border: `1.5px solid ${COLORS.border}`, outline: "none", fontFamily: "inherit",
  background: "#fff", color: COLORS.text, boxSizing: "border-box",
};

function TextInput(props) {
  const { style, ...rest } = props;
  return <input style={{ ...inputStyle, ...style }} {...rest} />;
}

function PasswordInput({ value, onChange, placeholder, style }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{ ...inputStyle, paddingRight: 46, ...style }}
      />
      <button type="button" onClick={() => setShow(s => !s)}
        aria-label={show ? "Ocultar senha" : "Mostrar senha"}
        style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: COLORS.textMuted, padding: 6 }}>
        {show ? <EyeOff size={22} /> : <Eye size={22} />}
      </button>
    </div>
  );
}

function Select({ value, onChange, options, placeholder }) {
  return (
    <select value={value} onChange={onChange} style={{ ...inputStyle, appearance: "auto" }}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function TopBar({ title, onBack, right }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "16px 18px", position: "sticky", top: 0, background: COLORS.bg, zIndex: 5,
      borderBottom: `1px solid ${COLORS.border}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 40 }}>
        {onBack && (
          <button onClick={onBack} aria-label="Voltar" style={{
            background: "#fff", border: `1.5px solid ${COLORS.border}`, borderRadius: 12,
            width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer"
          }}>
            <ChevronLeft size={24} color={COLORS.primary} />
          </button>
        )}
      </div>
      <h1 style={{ fontSize: 21, fontWeight: 800, color: COLORS.primaryDark, margin: 0, textAlign: "center", flex: 1 }}>{title}</h1>
      <div style={{ minWidth: 40, display: "flex", justifyContent: "flex-end" }}>{right}</div>
    </div>
  );
}

function IconBadge({ Icon, bg, color, size = 44 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 12, background: bg,
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
    }}>
      <Icon size={size * 0.5} color={color} />
    </div>
  );
}

function Toast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2600);
    return () => clearTimeout(t);
  }, [onClose]);
  if (!message) return null;
  return (
    <div style={{
      position: "fixed", bottom: 92, left: "50%", transform: "translateX(-50%)",
      background: COLORS.primaryDark, color: "#fff", padding: "14px 22px", borderRadius: 14,
      fontWeight: 700, fontSize: 16, zIndex: 100, boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
      display: "flex", alignItems: "center", gap: 10, maxWidth: "90%", textAlign: "center",
      pointerEvents: "none",
    }}>
      <CheckCircle2 size={22} /> {message}
    </div>
  );
}

function EmptyState({ icon: Icon = Info, text }) {
  return (
    <div style={{ textAlign: "center", padding: "40px 20px", color: COLORS.textMuted }}>
      <Icon size={38} style={{ marginBottom: 10, opacity: 0.6 }} />
      <div style={{ fontSize: 16 }}>{text}</div>
    </div>
  );
}

function Disclaimer({ text }) {
  return (
    <div style={{
      display: "flex", gap: 10, background: COLORS.warnBg, border: `1px solid #EEDDA0`,
      borderRadius: 12, padding: 12, fontSize: 13.5, color: "#6B5710", alignItems: "flex-start"
    }}>
      <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
      <span>{text || "O GlyControl tem finalidade educativa e não substitui consulta, diagnóstico ou tratamento com médico ou nutricionista."}</span>
    </div>
  );
}

/* ---------------------- NAVEGAÇÃO ----------------------
   Padrão simplificado, igual ao protótipo: os atalhos rápidos
   (Perfil / Chat / Calendário) ficam sempre visíveis no topo, e um
   único botão "Início" fica fixo embaixo para voltar ao painel
   principal a qualquer momento. */

function HomeBar({ onHome }) {
  return (
    <div style={{
      position: "sticky", bottom: 0, left: 0, right: 0, background: "#fff",
      borderTop: `1px solid ${COLORS.border}`, display: "flex", zIndex: 10,
      boxShadow: "0 -2px 10px rgba(0,0,0,0.04)",
    }}>
      <button onClick={onHome} style={{
        flex: 1, background: "none", border: "none", cursor: "pointer",
        padding: "10px 4px 8px", display: "flex", flexDirection: "column",
        alignItems: "center", gap: 3, color: COLORS.primary,
      }}>
        <Home size={26} strokeWidth={2.6} />
        <span style={{ fontSize: 13, fontWeight: 800 }}>Início</span>
      </button>
    </div>
  );
}

/* Atalhos rápidos do topo (Perfil / Chat / Calendário),
   mantendo o padrão visual do protótipo original — agora visíveis
   em qualquer tela do sistema. */
function TopShortcuts({ onNavigate, chatNaoLido }) {
  const items = [
    { key: "perfil", label: "Perfil", Icon: User },
    { key: "chat", label: "Chat", Icon: MessageCircle },
    { key: "calendario", label: "Calendário", Icon: Calendar },
  ];
  return (
    <div style={{ display: "flex", justifyContent: "space-around", padding: "4px 6px 18px" }}>
      {items.map(it => (
        <button key={it.key} onClick={() => onNavigate(it.key)} style={{
          background: "none", border: "none", cursor: "pointer", display: "flex",
          flexDirection: "column", alignItems: "center", gap: 4, color: COLORS.primaryDark, position: "relative",
        }}>
          <div style={{ position: "relative" }}>
            <it.Icon size={26} />
            {it.key === "chat" && chatNaoLido && (
              <div style={{
                position: "absolute", top: -3, right: -5, width: 12, height: 12, borderRadius: 6,
                background: COLORS.danger, border: "2px solid #fff",
              }} />
            )}
          </div>
          <span style={{ fontSize: 13, fontWeight: 700 }}>{it.label}</span>
        </button>
      ))}
    </div>
  );
}

/* ---------------------- MEDIDOR (GAUGE) DE GLICEMIA ---------------------- */

function GlicemiaGauge({ valor, classificacao }) {
  const has = valor !== null && valor !== undefined && valor !== "";
  const pct = has ? Math.max(0, Math.min(1, (Number(valor)) / 300)) : 0;
  const angle = 180 + pct * 180;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "10px 0 4px" }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.textMuted, marginBottom: 6 }}>Índice glicêmico</div>
      <div style={{ position: "relative", width: 200, height: 110 }}>
        <svg width="200" height="110" viewBox="0 0 200 110">
          <path d="M 10 100 A 90 90 0 0 1 190 100" fill="none" stroke="#E7E5DC" strokeWidth="16" strokeLinecap="round" />
          <path d="M 10 100 A 90 90 0 0 1 190 100" fill="none" stroke={has ? classificacao.color : "#D9D6C9"}
            strokeWidth="16" strokeLinecap="round"
            strokeDasharray={`${pct * 283} 283`} />
          <line x1="100" y1="100" x2={100 + 65 * Math.cos((angle * Math.PI) / 180)}
            y2={100 + 65 * Math.sin((angle * Math.PI) / 180)}
            stroke={COLORS.primaryDark} strokeWidth="3" strokeLinecap="round" />
          <circle cx="100" cy="100" r="6" fill={COLORS.primaryDark} />
        </svg>
        <div style={{ position: "absolute", top: 40, left: 0, right: 0, textAlign: "center" }}>
          <div style={{ fontSize: 34, fontWeight: 900, color: COLORS.text, lineHeight: 1 }}>{has ? Math.round(valor) : "0"}</div>
          <div style={{ fontSize: 13, color: COLORS.textMuted, fontWeight: 700 }}>mg/dL</div>
        </div>
      </div>
      {has && (
        <div style={{
          marginTop: 6, padding: "5px 14px", borderRadius: 20, background: classificacao.bg,
          color: classificacao.color, fontWeight: 800, fontSize: 14,
        }}>
          {classificacao.label}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   TELAS DE ABERTURA, CADASTRO E LOGIN
   ============================================================ */

function AppLogo({ size = 84 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size / 2, background: COLORS.primaryLight,
      display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", overflow: "hidden"
    }}>
      <img src={LOGO_DATA_URI} alt="Logo GlyControl" style={{ width: "78%", height: "78%", objectFit: "contain" }} />
    </div>
  );
}

function SplashScreen({ onContinue, onLogin }) {
  return (
    <div style={{ minHeight: "100vh", background: COLORS.primary, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
      <div style={{ width: 130, height: 130, borderRadius: 65, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 22, overflow: "hidden" }}>
        <img src={LOGO_DATA_URI} alt="Logo GlyControl" style={{ width: "80%", height: "80%", objectFit: "contain" }} />
      </div>
      <h1 style={{ color: "#fff", fontSize: 34, fontWeight: 900, margin: 0, fontFamily: "Georgia, serif" }}>GlyControl</h1>
      <p style={{ color: "#DCEEE0", fontSize: 16, marginTop: 10, maxWidth: 300 }}>Seu apoio diário no controle da Diabetes Tipo 2</p>
      <div style={{ marginTop: 46, width: "100%", maxWidth: 320, display: "flex", flexDirection: "column", gap: 14 }}>
        <button onClick={onLogin} style={{
          width: "100%", background: "#fff", color: COLORS.primaryDark, border: "none",
          borderRadius: 16, padding: "18px 20px", fontSize: 19, fontWeight: 800, cursor: "pointer",
          boxShadow: "0 4px 14px rgba(0,0,0,0.18)", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        }}>
          <User size={22} /> Já tenho conta — Entrar
        </button>
        <Btn onClick={onContinue} variant="subtle" size="lg" full>
          Conhecer o GlyControl <ArrowRight size={20} />
        </Btn>
      </div>
    </div>
  );
}

const ONBOARDING_SLIDES = [
  {
    title: "Bem-vindo ao GlyControl",
    Icon: Activity,
    text: "O GlyControl ajuda você a acompanhar sua alimentação, registrar sua glicemia e receber orientações para um melhor controle do Diabetes Mellitus Tipo 2.",
  },
  {
    title: "Conheça a interface principal",
    Icon: Home,
    text: "Perfil: visualize e edite seus dados. Comunidade: converse com outros usuários. Calendário: consulte registros antigos. Relatórios: acompanhe seu desempenho.",
  },
  {
    title: "Entenda seu índice glicêmico",
    Icon: BarChart2,
    text: "Verde (Adequado): 80 a 130 mg/dL. Amarelo (Atenção): 70–79 ou 131–180 mg/dL. Vermelho (Perigoso): ≤69 ou ≥181 mg/dL.",
  },
  {
    title: "Funcionalidades inteligentes",
    Icon: Sparkles,
    text: "Recomendações educativas e sugestões alimentares para apoiar seu controle glicêmico. Seus registros ficam organizados e podem ajudar na conversa com os profissionais que acompanham seu cuidado.",
  },
];

function OnboardingScreen({ onFinish }) {
  const [idx, setIdx] = useState(0);
  const slide = ONBOARDING_SLIDES[idx];
  const last = idx === ONBOARDING_SLIDES.length - 1;
  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, display: "flex", flexDirection: "column", padding: 24 }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <IconBadge Icon={slide.Icon} bg={COLORS.primaryLight} color={COLORS.primary} size={88} />
        <h2 style={{ fontSize: 24, fontWeight: 800, color: COLORS.text, margin: "24px 0 14px" }}>{slide.title}</h2>
        <p style={{ fontSize: 17, color: COLORS.textMuted, lineHeight: 1.5, maxWidth: 340 }}>{slide.text}</p>
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 26 }}>
        {ONBOARDING_SLIDES.map((_, i) => (
          <div key={i} style={{
            width: i === idx ? 22 : 9, height: 9, borderRadius: 5,
            background: i === idx ? COLORS.primary : "#D6D9CF", transition: "all .2s"
          }} />
        ))}
      </div>
      <Btn onClick={() => last ? onFinish() : setIdx(i => i + 1)}>
        {last ? "Começar" : "Próximo"}
      </Btn>
    </div>
  );
}

function AuthShell({ children }) {
  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, display: "flex", flexDirection: "column", justifyContent: "center", padding: "36px 22px" }}>
      <div style={{ maxWidth: 400, width: "100%", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 26 }}>
          <AppLogo size={72} />
          <h1 style={{ fontSize: 26, fontWeight: 900, color: COLORS.primaryDark, margin: "12px 0 0", fontFamily: "Georgia, serif" }}>GlyControl</h1>
        </div>
        {children}
      </div>
    </div>
  );
}

function LoginScreen({ onLogin, onGoCadastro, onGoEsqueci, error }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  return (
    <AuthShell>
      <Card>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginTop: 0, marginBottom: 18, color: COLORS.text }}>Entrar</h2>
        <Field label="E-mail">
          <TextInput type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" />
        </Field>
        <Field label="Senha">
          <PasswordInput value={senha} onChange={e => setSenha(e.target.value)} placeholder="Digite sua senha" />
        </Field>
        {error && <Disclaimer text={error} />}
        <div style={{ height: 8 }} />
        <Btn onClick={() => onLogin(email.trim().toLowerCase(), senha)}>Entrar</Btn>
        <div style={{ textAlign: "center", marginTop: 18, display: "flex", flexDirection: "column", gap: 10 }}>
          <button onClick={onGoCadastro} style={{ background: "none", border: "none", color: COLORS.primary, fontWeight: 700, fontSize: 15, cursor: "pointer", textDecoration: "underline" }}>Fazer conta</button>
          <button onClick={onGoEsqueci} style={{ background: "none", border: "none", color: COLORS.primary, fontWeight: 700, fontSize: 15, cursor: "pointer", textDecoration: "underline" }}>Esqueci minha senha</button>
        </div>
      </Card>
    </AuthShell>
  );
}

function CadastroScreen({ onCadastrar, onVoltar, erroExterno }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [idade, setIdade] = useState("");
  const [sexo, setSexo] = useState("");
  const [erros, setErros] = useState({});
  const [tentouEnviar, setTentouEnviar] = useState(false);
  const req = validarSenha(senha);

  const nomeOk = !!nome.trim();
  const emailOk = emailValido(email);
  const senhaOk = senhaValida(senha);
  const confirmarOk = !!confirmarSenha && confirmarSenha === senha;
  const idadeOk = !!idade && Number(idade) >= 1 && Number(idade) <= 120;
  const formValido = nomeOk && emailOk && senhaOk && confirmarOk && idadeOk;

  function validar() {
    const e = {};
    if (!nomeOk) e.nome = "Informe seu nome completo.";
    if (!email.trim()) e.email = "Informe seu e-mail.";
    else if (!emailOk) e.email = "E-mail inválido.";
    if (!senhaOk) e.senha = "A senha não atende aos requisitos abaixo.";
    if (!confirmarOk) e.confirmarSenha = "As senhas não coincidem.";
    if (!idadeOk) e.idade = "Informe uma idade válida.";
    setErros(e);
    return Object.keys(e).length === 0;
  }

  function submit() {
    setTentouEnviar(true);
    if (!validar() || !formValido) return;
    onCadastrar({ nome: nome.trim(), email: email.trim().toLowerCase(), senha, idade, sexo: sexo || "Não quero informar" });
  }

  const errosVisiveis = tentouEnviar ? erros : {};

  return (
    <AuthShell>
      <Card>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginTop: 0, marginBottom: 18, color: COLORS.text }}>Criar conta</h2>
        <Field label="Nome completo" error={errosVisiveis.nome}>
          <div style={{ position: "relative" }}>
            <TextInput value={nome} onChange={e => setNome(e.target.value)} placeholder="Digite ou fale seu nome" style={{ paddingRight: 46 }} />
            <VoiceSearchButton onResult={texto => setNome(texto)} label="Falar o nome" />
          </div>
        </Field>
        <Field label="E-mail" error={errosVisiveis.email}>
          <TextInput type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" />
        </Field>
        <Field label="Senha" error={errosVisiveis.senha}>
          <PasswordInput value={senha} onChange={e => setSenha(e.target.value)} placeholder="Crie uma senha" />
        </Field>
        <Field label="Confirmar senha" error={errosVisiveis.confirmarSenha}>
          <PasswordInput value={confirmarSenha} onChange={e => setConfirmarSenha(e.target.value)} placeholder="Repita a senha" />
        </Field>
        <Field label="Idade" error={errosVisiveis.idade}>
          <TextInput type="number" min="1" max="120" value={idade} onChange={e => setIdade(e.target.value)} placeholder="Ex: 62" />
        </Field>
        {/* Campo "Sexo": só 3 opções, a pedido — sem categoria "Outro". */}
        <Field label="Sexo">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {["Feminino", "Masculino", "Não quero informar"].map(op => (
              <label key={op} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 16, cursor: "pointer" }}>
                <input type="radio" name="sexo" checked={sexo === op} onChange={() => setSexo(op)} style={{ width: 20, height: 20 }} />
                {op}
              </label>
            ))}
          </div>
        </Field>
        <div style={{ background: COLORS.bg, borderRadius: 12, padding: 14, marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>A senha deve conter:</div>
          {[
            ["minimo6", "Mínimo de 6 caracteres"],
            ["maiuscula", "Pelo menos 1 letra maiúscula"],
            ["numero", "Pelo menos 1 número"],
            ["especial", "Pelo menos 1 caractere especial"],
          ].map(([k, label]) => (
            <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, marginBottom: 4, color: req[k] ? COLORS.primary : COLORS.textMuted }}>
              {req[k] ? <Check size={16} /> : <X size={16} color="#B7BCB0" />} {label}
            </div>
          ))}
        </div>
        {erroExterno && <Disclaimer text={erroExterno} />}
        <div style={{ height: 8 }} />
        <Btn onClick={submit} disabled={tentouEnviar && !formValido}>Continuar</Btn>
        {tentouEnviar && !formValido && (
          <div style={{ marginTop: 10, textAlign: "center", fontSize: 13.5, color: COLORS.danger, fontWeight: 700 }}>
            Corrija os campos destacados acima para continuar.
          </div>
        )}
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <button onClick={onVoltar} style={{ background: "none", border: "none", color: COLORS.primary, fontWeight: 700, fontSize: 15, cursor: "pointer", textDecoration: "underline" }}>Já tenho conta</button>
        </div>
      </Card>
    </AuthShell>
  );
}

function EsqueciSenhaScreen({ onVoltar, onRedefinir, usuarios }) {
  const [email, setEmail] = useState("");
  const [etapa, setEtapa] = useState("pedir"); // pedir | redefinir | ok
  const [novaSenha, setNovaSenha] = useState("");
  const [erro, setErro] = useState("");

  function pedir() {
    const e = email.trim().toLowerCase();
    if (!usuarios[e]) { setErro("Não encontramos uma conta com esse e-mail."); return; }
    setErro("");
    setEtapa("redefinir");
  }
  function redefinir() {
    if (!senhaValida(novaSenha)) { setErro("A nova senha não atende aos requisitos mínimos."); return; }
    onRedefinir(email.trim().toLowerCase(), novaSenha);
    setEtapa("ok");
  }

  return (
    <AuthShell>
      <Card>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginTop: 0, marginBottom: 14, color: COLORS.text }}>Recuperar senha</h2>
        {etapa === "pedir" && (
          <>
            <Field label="Informe o e-mail da sua conta" error={erro}>
              <TextInput type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" />
            </Field>
            <Btn onClick={pedir}>Continuar</Btn>
          </>
        )}
        {etapa === "redefinir" && (
          <>
            <p style={{ color: COLORS.textMuted, fontSize: 15 }}>Defina sua nova senha para <b>{email}</b>.</p>
            <Field label="Nova senha" error={erro}>
              <PasswordInput value={novaSenha} onChange={e => setNovaSenha(e.target.value)} placeholder="Nova senha" />
            </Field>
            <Btn onClick={redefinir}>Redefinir senha</Btn>
          </>
        )}
        {etapa === "ok" && (
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            <CheckCircle2 size={44} color={COLORS.primary} />
            <p style={{ fontSize: 16, marginTop: 10 }}>Senha redefinida com sucesso!</p>
            <Btn onClick={onVoltar}>Ir para o login</Btn>
          </div>
        )}
        {etapa !== "ok" && (
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <button onClick={onVoltar} style={{ background: "none", border: "none", color: COLORS.primary, fontWeight: 700, fontSize: 15, cursor: "pointer", textDecoration: "underline" }}>Voltar ao login</button>
          </div>
        )}
      </Card>
    </AuthShell>
  );
}

/* ============================================================
   HOME / DASHBOARD
   ============================================================ */

function HomeScreen({ userData, onNavigate }) {
  const glicemias = userData.glicemias || [];
  const ultimaGlicemia = [...glicemias].sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora))[0];
  const rangesUsuario = getRangesDoUsuario(userData.perfil);
  const classi = ultimaGlicemia ? classificarGlicemia(ultimaGlicemia.valor, rangesUsuario) : classificarGlicemia(null, rangesUsuario);

  return (
    <div>
      <Card style={{ margin: "20px 18px 22px" }}>
        <GlicemiaGauge valor={ultimaGlicemia ? ultimaGlicemia.valor : null} classificacao={classi} />
        <div style={{ display: "flex", justifyContent: "space-around", marginTop: 6, paddingTop: 12, borderTop: `1px solid ${COLORS.border}` }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 13, color: COLORS.textMuted, fontWeight: 700 }}>Data</div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{ultimaGlicemia ? fmtData(ultimaGlicemia.dataHora) : "--/--/----"}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 13, color: COLORS.textMuted, fontWeight: 700 }}>Horário</div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{ultimaGlicemia ? fmtHora(ultimaGlicemia.dataHora) : "--:--"}</div>
          </div>
        </div>
      </Card>

      <div style={{ padding: "0 18px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
        <Btn variant="primary" icon={Plus} onClick={() => onNavigate("registrarGlicemia")}>Faça seu Registro</Btn>
        <Btn variant="blue" icon={Sparkles} onClick={() => onNavigate("recomendacoes")}>Recomendações</Btn>
        <Btn variant="purple" icon={Salad} onClick={() => onNavigate("sugestoes")}>Sugestões Alimentares</Btn>
      </div>
    </div>
  );
}

/* ============================================================
   GLICEMIA — Registro, Histórico e Gráfico
   ============================================================ */

function RegistrarGlicemiaScreen({ onSalvar, onVoltar }) {
  const [jejum, setJejum] = useState(null);
  const [contexto, setContexto] = useState("");
  const [valor, setValor] = useState("");
  const [aguaMl, setAguaMl] = useState(0);
  const [data, setData] = useState(() => new Date().toISOString().slice(0, 10));
  const [hora, setHora] = useState(() => new Date().toTimeString().slice(0, 5));
  const [obs, setObs] = useState("");
  const [alimentosAnotados, setAlimentosAnotados] = useState([]);
  const [buscaAberta, setBuscaAberta] = useState(false);
  const [erro, setErro] = useState("");

  function adicionarAlimentoAnotado(alimento, qtd, medidaLabel) {
    setAlimentosAnotados(list => [...list, { id: uid("nota"), nome: alimento.nome, qtdG: qtd, medida: medidaLabel || `${qtd} g` }]);
    setBuscaAberta(false);
  }

  function removerAlimentoAnotado(id) {
    setAlimentosAnotados(list => list.filter(a => a.id !== id));
  }

  function submit() {
    if (!valor || Number(valor) <= 0 || Number(valor) > 900) {
      setErro("Informe um valor de glicemia válido (em mg/dL).");
      return;
    }
    const ctx = contexto || (jejum === true ? "Jejum" : jejum === false ? "Outro" : "Outro");
    const dataHora = new Date(`${data}T${hora}:00`).toISOString();
    const notaAlimentos = alimentosAnotados.length
      ? `Alimentos: ${alimentosAnotados.map(a => `${a.nome} (${a.medida})`).join(", ")}.`
      : "";
    const observacaoFinal = [obs.trim(), notaAlimentos].filter(Boolean).join(" ");
    onSalvar({
      valor: Number(valor), dataHora, contexto: ctx, observacao: observacaoFinal,
    }, aguaMl > 0 ? Number(aguaMl) : null);
  }

  return (
    <div>
      <TopBar title="Registrar Glicemia" onBack={onVoltar} />
      <div style={{ padding: "8px 18px 28px" }}>
        <Field label="Está em jejum?">
          <div style={{ display: "flex", gap: 24 }}>
            {[["Sim", true], ["Não", false]].map(([label, v]) => (
              <label key={label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 16, cursor: "pointer" }}>
                <input type="radio" checked={jejum === v} onChange={() => { setJejum(v); if (v) setContexto("Jejum"); }} style={{ width: 20, height: 20 }} />
                {label}
              </label>
            ))}
          </div>
        </Field>

        <Field label="Contexto da medição">
          <Select value={contexto} onChange={e => setContexto(e.target.value)} options={CONTEXTOS_GLICEMIA} placeholder="Selecione o contexto" />
        </Field>

        <Field label="Índice glicêmico (mg/dL)" error={erro}>
          <TextInput type="number" value={valor} onChange={e => setValor(e.target.value)} placeholder="Ex: 120" style={{ fontSize: 22, fontWeight: 800, textAlign: "center" }} />
        </Field>

        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <Field label="Data">
              <TextInput type="date" value={data} onChange={e => setData(e.target.value)} />
            </Field>
          </div>
          <div style={{ flex: 1 }}>
            <Field label="Horário">
              <TextInput type="time" value={hora} onChange={e => setHora(e.target.value)} />
            </Field>
          </div>
        </div>

        <Field label="Consumo de água neste momento (opcional)">
          <div style={{ display: "flex", alignItems: "center", gap: 14, justifyContent: "center" }}>
            <button onClick={() => setAguaMl(v => Math.max(0, v - 50))} style={{
              width: 44, height: 44, borderRadius: 22, border: "none", background: COLORS.primary,
              color: "#fff", fontSize: 22, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
            }}><Minus size={22} /></button>
            <div style={{ fontSize: 24, fontWeight: 800, minWidth: 90, textAlign: "center" }}>{aguaMl} <span style={{ fontSize: 14, color: COLORS.textMuted }}>ml</span></div>
            <button onClick={() => setAguaMl(v => v + 50)} style={{
              width: 44, height: 44, borderRadius: 22, border: "none", background: COLORS.primary,
              color: "#fff", fontSize: 22, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
            }}><Plus size={22} /></button>
          </div>
        </Field>

        <Field label="Alimentos ingeridos (opcional)" hint="Fica anotado junto com esse registro. Para calcular nutrientes de uma refeição completa, use a aba Comida.">
          <Btn variant="outline" size="md" icon={Search} onClick={() => setBuscaAberta(true)}>Pesquisar alimento</Btn>
          {alimentosAnotados.length > 0 && (
            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
              {alimentosAnotados.map(a => (
                <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: COLORS.bg, borderRadius: 10, padding: "8px 12px" }}>
                  <span style={{ fontSize: 14.5 }}>{a.nome} ({a.medida})</span>
                  <button onClick={() => removerAlimentoAnotado(a.id)} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.danger }}>
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Field>

        <Field label="Observações (opcional)">
          <div style={{ position: "relative" }}>
            <textarea value={obs} onChange={e => setObs(e.target.value)} rows={3} placeholder="Ex: senti tontura, esqueci a medicação... (ou toque no microfone e fale)"
              style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit", paddingRight: 46 }} />
            <VoiceSearchButton onResult={texto => setObs(v => (v ? v + " " : "") + texto)} label="Ditar observação por voz" />
          </div>
        </Field>

        <Btn onClick={submit}>Salvar registro</Btn>
      </div>
      {buscaAberta && <FoodSearchModal onClose={() => setBuscaAberta(false)} onAdd={adicionarAlimentoAnotado} />}
    </div>
  );
}

function GlicemiaHistoricoScreen({ userData, onVoltar, onNovo }) {
  const [filtro, setFiltro] = useState("7");
  const glicemias = [...(userData.glicemias || [])].sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora));

  const filtradas = glicemias.filter(g => {
    if (filtro === "hoje") return isSameDay(g.dataHora, new Date());
    if (filtro === "7") return withinDays(g.dataHora, 7);
    if (filtro === "30") return withinDays(g.dataHora, 30);
    return true;
  });

  const chartData = [...filtradas].sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora))
    .map(g => ({ label: `${fmtData(g.dataHora).slice(0, 5)} ${fmtHora(g.dataHora)}`, valor: g.valor }));

  return (
    <div>
      <TopBar title="Histórico de Glicemia" onBack={onVoltar} />
      <div style={{ padding: "10px 18px" }}>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 16 }}>
          {[["hoje", "Hoje"], ["7", "7 dias"], ["30", "30 dias"], ["todos", "Todos"]].map(([v, label]) => (
            <button key={v} onClick={() => setFiltro(v)} style={{
              padding: "9px 16px", borderRadius: 20, border: `1.5px solid ${filtro === v ? COLORS.primary : COLORS.border}`,
              background: filtro === v ? COLORS.primary : "#fff", color: filtro === v ? "#fff" : COLORS.text,
              fontWeight: 700, fontSize: 14, cursor: "pointer", whiteSpace: "nowrap"
            }}>{label}</button>
          ))}
        </div>

        {chartData.length > 1 && (
          <Card style={{ marginBottom: 16, padding: "16px 8px" }}>
            <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 8, paddingLeft: 10 }}>Evolução</div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData} margin={{ top: 5, right: 14, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEEDE3" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11 }} domain={[0, 'dataMax + 30']} />
                <Tooltip />
                <Line type="monotone" dataKey="valor" stroke={COLORS.primary} strokeWidth={3} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        )}

        <Btn onClick={onNovo} icon={Plus} size="md" style={{ marginBottom: 16 }}>Novo registro</Btn>

        {filtradas.length === 0 ? (
          <EmptyState icon={Activity} text="Nenhum registro de glicemia neste período." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtradas.map(g => {
              const c = classificarGlicemia(g.valor, getRangesDoUsuario(userData.perfil));
              return (
                <Card key={g.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 14, height: 14, borderRadius: 7, background: c.color, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 17 }}>{g.valor} mg/dL <span style={{ fontWeight: 700, fontSize: 12, color: c.color }}>· {c.label}</span></div>
                    <div style={{ fontSize: 13.5, color: COLORS.textMuted }}>{fmtDataHora(g.dataHora)} · {g.contexto}</div>
                    {g.observacao && <div style={{ fontSize: 13.5, color: COLORS.text, marginTop: 3, fontStyle: "italic" }}>"{g.observacao}"</div>}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   ALIMENTAÇÃO — Busca de alimentos, Registro de refeição, Histórico
   ============================================================ */

/* Pequeno mapa de sinônimos para aproximar termos comuns do dia a
/* Normaliza texto removendo acentuação e caixa, para busca mais
   tolerante (usuário não precisa digitar acento certo). */
function normalizarTexto(s) {
  return (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/* Sinônimos de frase: termos do dia a dia que a TACO nomeia de
   forma diferente. Aplicados por substituição antes de quebrar em
   palavras — não inventamos alimento novo, só aproximamos o nome
   comum do nome técnico já existente no banco. */
const FRASE_SINONIMOS_BUSCA = {
  "arroz branco": "arroz tipo 1",
  "batata frita": "batata inglesa frita",
  "carne moida": "acem moido",
  "coca": "refrigerante tipo cola",
  "guarana": "refrigerante tipo guarana",
  "bolacha": "biscoito",
  "peito de frango": "frango peito",
  "coxa de frango": "frango coxa",
  "sobrecoxa": "frango sobrecoxa",
  "bife": "carne bovina contra file",
  "queijo branco": "queijo minas frescal",
  "queijo minas": "queijo minas",
  "salgadinho": "industrializado",
  "leite em po": "leite de vaca po",
  "leite integral": "leite de vaca integral",
  "linguica de frango": "linguica frango",
  "linguica de porco": "linguica porco",
  "cafe com leite": "cafe",
  "torrada": "torrada pao frances",
  "farinha de trigo": "farinha de trigo",
  "azeite": "azeite de oliva",
};

/* Quebra a busca em palavras e aplica sinônimos de frase antes.
   A comparação exige TODAS as palavras (em qualquer ordem), o que
   já resolve a maioria dos casos sem precisar de sinônimo manual
   — ex.: "molho tomate" encontra "tomate molho industrializado". */
function termosDeBusca(query) {
  let q = normalizarTexto(query.trim());
  for (const [frase, subst] of Object.entries(FRASE_SINONIMOS_BUSCA)) {
    const fraseNorm = normalizarTexto(frase);
    if (q.includes(fraseNorm)) {
      q = q.replace(fraseNorm, normalizarTexto(subst));
    }
  }
  return q.split(/\s+/).filter(Boolean);
}

/* Botão de "falar em vez de digitar", usando a Web Speech API do
   navegador. Reaproveitado em TODOS os campos de texto importantes
   do app (pesquisa de alimento, chat com a Ana, observações da
   glicemia, comunidade, nome no cadastro/perfil) — pedido explícito
   do usuário para deixar o app o mais simples possível para idosos
   que têm dificuldade para digitar.
   Em navegadores sem suporte (ex.: alguns em iOS), o botão fica
   desabilitado com uma dica, em vez de falhar silenciosamente.
   - onResult(texto): chamado com o texto reconhecido.
   - autoSubmit: se true, chama onResult e já entende que quem usou
     o botão quer "enviar" o texto na hora (usado no chat da Ana,
     onde a pessoa aperta, fala a pergunta, e ela já é enviada,
     sem precisar apertar mais nada).
   - label: rótulo acessível (leitor de tela / title do botão). */
function VoiceSearchButton({ onResult, label = "Falar em vez de digitar" }) {
  const [ouvindo, setOuvindo] = useState(false);
  const suportado = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);

  function iniciarEscuta() {
    if (!suportado || ouvindo) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = "pt-BR";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onstart = () => setOuvindo(true);
    rec.onend = () => setOuvindo(false);
    rec.onerror = () => setOuvindo(false);
    rec.onresult = (e) => {
      const texto = e.results?.[0]?.[0]?.transcript || "";
      if (texto) onResult(texto);
    };
    try { rec.start(); } catch (e) { setOuvindo(false); }
  }

  return (
    <button
      type="button"
      onClick={iniciarEscuta}
      aria-label={label}
      title={suportado ? label : "Reconhecimento de voz não disponível neste navegador"}
      style={{
        position: "absolute", right: 6, top: 6, width: 36, height: 36, borderRadius: 10,
        border: "none", background: ouvindo ? COLORS.dangerBg : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: suportado ? "pointer" : "not-allowed", opacity: suportado ? 1 : 0.4,
      }}>
      <Mic size={20} color={ouvindo ? COLORS.danger : COLORS.textMuted} />
    </button>
  );
}

function FoodSearchModal({ onClose, onAdd }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [selecionado, setSelecionado] = useState(null);
  const opcoesMedida = useMemo(() => selecionado ? gerarOpcoesMedida(selecionado) : [], [selecionado]);
  const [opcaoIdx, setOpcaoIdx] = useState(0);

  function selecionar(f) {
    setSelecionado(f);
    const opcoes = gerarOpcoesMedida(f);
    const idxPadrao = opcoes.findIndex(o => o.multiplicador === 1);
    setOpcaoIdx(idxPadrao >= 0 ? idxPadrao : 0);
  }

  const resultados = useMemo(() => {
    let list = FOOD_DB;
    if (cat) list = list.filter(f => f.categoria === cat);
    if (q.trim()) {
      const tokens = termosDeBusca(q);
      list = list.filter(f => {
        const nomeNorm = normalizarTexto(f.nome);
        const catNorm = normalizarTexto(f.categoria);
        return tokens.every(t => nomeNorm.includes(t) || catNorm.includes(t));
      });
    }
    return list.slice(0, 150);
  }, [q, cat]);

  if (selecionado) {
    const opcaoAtual = opcoesMedida[opcaoIdx] || opcoesMedida[0];
    const preview = calcularItemRefeicao(selecionado, opcaoAtual.qtdG);
    return (
      <div style={modalOverlay}>
        <div style={modalSheet}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ margin: 0, fontSize: 19, fontWeight: 800 }}>{selecionado.nome}</h3>
            <button onClick={() => setSelecionado(null)} style={iconCloseBtn}><X size={22} /></button>
          </div>
          <div style={{ fontSize: 14, color: COLORS.textMuted, marginBottom: 16 }}>
            {selecionado.categoria}
          </div>
          <Field label="Quantidade">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={() => setOpcaoIdx(i => Math.max(0, i - 1))} disabled={opcaoIdx === 0} style={{ ...stepBtn, opacity: opcaoIdx === 0 ? 0.4 : 1 }}><Minus size={20} /></button>
              <div style={{ flex: 1, textAlign: "center", fontWeight: 800, fontSize: 18, background: "#fff", border: `1.5px solid ${COLORS.border}`, borderRadius: 12, padding: "12px 8px" }}>
                {opcaoAtual.label}
              </div>
              <button onClick={() => setOpcaoIdx(i => Math.min(opcoesMedida.length - 1, i + 1))} disabled={opcaoIdx === opcoesMedida.length - 1} style={{ ...stepBtn, opacity: opcaoIdx === opcoesMedida.length - 1 ? 0.4 : 1 }}><Plus size={20} /></button>
            </div>
          </Field>
          <Card style={{ background: COLORS.primaryLight, border: "none", marginBottom: 16 }}>
            <div style={{ fontWeight: 800, marginBottom: 8, fontSize: 15 }}>Informações da sua porção</div>
            <NutrientGrid n={preview} />
          </Card>
          <Btn onClick={() => onAdd(selecionado, opcaoAtual.qtdG, opcaoAtual.label)}>Adicionar à refeição</Btn>
        </div>
      </div>
    );
  }

  return (
    <div style={modalOverlay}>
      <div style={{ ...modalSheet, display: "flex", flexDirection: "column", maxHeight: "88vh" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: 19, fontWeight: 800 }}>Pesquisar alimento</h3>
          <button onClick={onClose} style={iconCloseBtn}><X size={22} /></button>
        </div>
        <div style={{ position: "relative", marginBottom: 10 }}>
          <Search size={20} style={{ position: "absolute", left: 14, top: 14, color: COLORS.textMuted }} />
          <TextInput value={q} onChange={e => setQ(e.target.value)} placeholder="Ex: arroz, frango, maçã..." autoFocus style={{ paddingLeft: 44, paddingRight: 46 }} />
          <VoiceSearchButton onResult={texto => setQ(texto)} label="Pesquisar alimento por voz" />
        </div>
        <div style={{ marginBottom: 10 }}>
          <Select value={cat} onChange={e => setCat(e.target.value)} options={CATEGORIES} placeholder="Todas as categorias" />
        </div>
        <div style={{ overflowY: "auto", flex: 1 }}>
          {resultados.length === 0 ? (
            <EmptyState icon={Search} text="Nenhum alimento encontrado. Tente outro termo." />
          ) : resultados.map(f => (
            <button key={f.id} onClick={() => selecionar(f)} style={{
              width: "100%", textAlign: "left", background: "#fff", border: `1px solid ${COLORS.border}`,
              borderRadius: 12, padding: "12px 14px", marginBottom: 8, cursor: "pointer",
            }}>
              <div style={{ fontWeight: 700, fontSize: 15.5 }}>{f.nome}</div>
              <div style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 2 }}>{f.categoria} · Porção: {f.medida}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const modalOverlay = {
  position: "fixed", inset: 0, background: "rgba(20,30,20,0.45)", zIndex: 50,
  display: "flex", alignItems: "flex-end", justifyContent: "center",
};
const modalSheet = {
  background: COLORS.bg, width: "100%", maxWidth: 480, borderRadius: "22px 22px 0 0",
  padding: "20px 18px 26px", boxShadow: "0 -6px 24px rgba(0,0,0,0.2)",
};
const iconCloseBtn = { background: COLORS.border, border: "none", borderRadius: 10, width: 36, height: 36, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" };
const stepBtn = { width: 42, height: 42, borderRadius: 21, border: "none", background: COLORS.primary, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 };

function NutrientGrid({ n }) {
  const items = [
    ["Calorias", n.kcal, "kcal"], ["Carboidratos", n.carb, "g"], ["Proteínas", n.prot, "g"],
    ["Gorduras", n.gord, "g"], ["Fibras", n.fibra, "g"], ["Sódio", n.sodio, "mg"],
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      {items.map(([label, val, unit]) => (
        <div key={label}>
          <div style={{ fontSize: 12.5, color: COLORS.textMuted, fontWeight: 700 }}>{label}</div>
          <div style={{ fontSize: 16, fontWeight: 800 }}>{val != null ? round1(val) : "—"} {val != null ? unit : ""}</div>
        </div>
      ))}
    </div>
  );
}

function AlimentacaoScreen({ userData, onSalvarRefeicao, onVoltar, onVerHistorico, rascunho, onMudarRascunho }) {
  const tipo = rascunho.tipo;
  const itens = rascunho.itens;
  const [buscaAberta, setBuscaAberta] = useState(false);

  function setTipo(novoTipo) { onMudarRascunho({ ...rascunho, tipo: novoTipo }); }
  function setItens(updater) {
    const novaLista = typeof updater === "function" ? updater(itens) : updater;
    onMudarRascunho({ ...rascunho, itens: novaLista });
  }

  const totais = somarNutrientes(itens);

  function adicionarItem(alimento, qtd, medidaLabel) {
    const calc = calcularItemRefeicao(alimento, qtd);
    setItens(list => [...list, { id: uid("item"), alimentoId: alimento.id, nome: alimento.nome, qtdG: qtd, medida: medidaLabel || `${qtd} g`, ...calc }]);
    setBuscaAberta(false);
  }

  function removerItem(id) {
    setItens(list => list.filter(i => i.id !== id));
  }

  function salvar() {
    if (!tipo || itens.length === 0) return;
    onSalvarRefeicao({ tipo, itens, totais, dataHora: nowISO() });
    onMudarRascunho({ tipo: "", itens: [] });
  }

  return (
    <div>
      <TopBar title="Registrar Refeição" onBack={onVoltar} />
      <div style={{ padding: "8px 18px 100px" }}>
        <Field label="Tipo de refeição">
          <Select value={tipo} onChange={e => setTipo(e.target.value)} options={TIPOS_REFEICAO} placeholder="Selecione o tipo" />
        </Field>

        <Btn variant="outline" icon={Search} onClick={() => setBuscaAberta(true)} size="md" style={{ marginBottom: 16 }}>Pesquisar e adicionar alimento</Btn>

        {itens.length === 0 ? (
          <EmptyState icon={Utensils} text="Nenhum alimento adicionado ainda." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
            {itens.map(it => (
              <Card key={it.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15.5 }}>{it.nome}</div>
                  <div style={{ fontSize: 13, color: COLORS.textMuted }}>Quantidade: {it.medida || `${it.qtdG} g`} · {round1(it.carb)}g carb</div>
                </div>
                <button onClick={() => removerItem(it.id)} style={{ background: COLORS.dangerBg, border: "none", borderRadius: 10, width: 36, height: 36, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Trash2 size={18} color={COLORS.danger} />
                </button>
              </Card>
            ))}
          </div>
        )}

        {itens.length > 0 && (
          <Card style={{ background: COLORS.primaryLight, border: "none", marginBottom: 18 }}>
            <div style={{ fontWeight: 800, marginBottom: 10, fontSize: 16 }}>Total da refeição</div>
            <NutrientGrid n={totais} />
          </Card>
        )}

        <Btn onClick={salvar} disabled={!tipo || itens.length === 0}>Salvar refeição</Btn>
        <div style={{ height: 10 }} />
        <Btn variant="ghost" onClick={onVerHistorico}>Ver histórico alimentar</Btn>
      </div>
      {buscaAberta && <FoodSearchModal onClose={() => setBuscaAberta(false)} onAdd={adicionarItem} />}
    </div>
  );
}

function HistoricoAlimentarScreen({ userData, onVoltar }) {
  const [aberto, setAberto] = useState(null);
  const refeicoes = [...(userData.refeicoes || [])].sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora));
  return (
    <div>
      <TopBar title="Histórico Alimentar" onBack={onVoltar} />
      <div style={{ padding: "10px 18px 30px" }}>
        {refeicoes.length === 0 ? (
          <EmptyState icon={Utensils} text="Nenhuma refeição registrada ainda." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {refeicoes.map(r => (
              <Card key={r.id} onClick={() => setAberto(aberto === r.id ? null : r.id)}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 16 }}>{r.tipo}</div>
                    <div style={{ fontSize: 13.5, color: COLORS.textMuted }}>{fmtDataHora(r.dataHora)}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 800 }}>{r.itens.length} {r.itens.length === 1 ? "item" : "itens"}</div>
                    <div style={{ fontSize: 13, color: COLORS.textMuted }}>{round1(r.totais.carb)}g carb</div>
                  </div>
                </div>
                {aberto === r.id && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${COLORS.border}` }}>
                    {r.itens.map(it => (
                      <div key={it.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 14.5, padding: "5px 0" }}>
                        <span>{it.nome}</span>
                        <span style={{ color: COLORS.textMuted }}>{it.medida || `${it.qtdG} g`}</span>
                      </div>
                    ))}
                    <div style={{ marginTop: 8 }}>
                      <NutrientGrid n={r.totais} />
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   ÁGUA — Registro, meta e histórico
   ============================================================ */

function AguaScreen({ userData, onRegistrarAgua, onAtualizarMeta, onVoltar }) {
  const [metaEdit, setMetaEdit] = useState(false);
  const [novaMeta, setNovaMeta] = useState(userData.perfil.metaAguaMl || 2000);
  const agua = [...(userData.agua || [])].sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora));
  const hoje = agua.filter(a => isSameDay(a.dataHora, new Date()));
  const totalHoje = hoje.reduce((s, a) => s + a.ml, 0);
  const meta = userData.perfil.metaAguaMl || 2000;
  const pct = Math.min(100, Math.round((totalHoje / meta) * 100));
  const falta = Math.max(0, meta - totalHoje);

  return (
    <div>
      <TopBar title="Hidratação" onBack={onVoltar} />
      <div style={{ padding: "10px 18px 30px" }}>
        <Card style={{ textAlign: "center", marginBottom: 18 }}>
          <div style={{ fontSize: 15, color: COLORS.textMuted, fontWeight: 700 }}>Consumido hoje</div>
          <div style={{ fontSize: 38, fontWeight: 900, color: COLORS.blue, margin: "6px 0" }}>{totalHoje} <span style={{ fontSize: 16 }}>ml</span></div>
          <div style={{ height: 14, background: COLORS.border, borderRadius: 8, overflow: "hidden", margin: "10px 0" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: COLORS.blue, borderRadius: 8, transition: "width .3s" }} />
          </div>
          <div style={{ fontSize: 14, color: COLORS.textMuted }}>{pct}% da meta de {meta} ml — faltam {falta} ml</div>
        </Card>

        <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 10 }}>Registrar consumo</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
          {[200, 300, 500].map(ml => (
            <button key={ml} onClick={() => onRegistrarAgua(ml)} style={{
              padding: "16px 8px", borderRadius: 14, border: `1.5px solid ${COLORS.blue}`, background: COLORS.blueBg,
              color: COLORS.blue, fontWeight: 800, fontSize: 16, cursor: "pointer"
            }}>+{ml}ml</button>
          ))}
        </div>
        <CustomAguaInput onAdd={onRegistrarAgua} />

        <div style={{ marginTop: 22, marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontWeight: 800, fontSize: 15 }}>Meta diária</div>
          <button onClick={() => setMetaEdit(m => !m)} style={{ background: "none", border: "none", color: COLORS.primary, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
            <Edit2 size={16} /> {metaEdit ? "Cancelar" : "Editar"}
          </button>
        </div>
        {metaEdit ? (
          <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
            <TextInput type="number" value={novaMeta} onChange={e => setNovaMeta(Number(e.target.value))} />
            <Btn full={false} size="md" onClick={() => { onAtualizarMeta(novaMeta); setMetaEdit(false); }}>Salvar</Btn>
          </div>
        ) : (
          <div style={{ fontSize: 16, color: COLORS.textMuted, marginBottom: 20 }}>{meta} ml por dia</div>
        )}

        <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 10 }}>Histórico</div>
        {agua.length === 0 ? (
          <EmptyState icon={Droplet} text="Nenhum registro de água ainda." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {agua.slice(0, 40).map(a => (
              <Card key={a.id} style={{ display: "flex", justifyContent: "space-between", padding: 12 }}>
                <span style={{ fontWeight: 700 }}>{a.ml} ml</span>
                <span style={{ color: COLORS.textMuted, fontSize: 14 }}>{fmtDataHora(a.dataHora)}</span>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CustomAguaInput({ onAdd }) {
  const [v, setV] = useState(100);
  return (
    <div style={{ display: "flex", gap: 10, marginBottom: 4 }}>
      <TextInput type="number" value={v} onChange={e => setV(Number(e.target.value))} placeholder="ml personalizado" />
      <Btn full={false} size="md" onClick={() => v > 0 && onAdd(v)}>Adicionar</Btn>
    </div>
  );
}

/* ============================================================
   RELATÓRIOS — Estatísticas integradas (glicemia, alimentação, água)
   ============================================================ */

function filtrarPorPeriodo(lista, campoData, periodo, custom) {
  if (periodo === "7") return lista.filter(x => withinDays(x[campoData], 7));
  if (periodo === "30") return lista.filter(x => withinDays(x[campoData], 30));
  if (periodo === "custom" && custom.inicio && custom.fim) {
    const ini = new Date(custom.inicio).getTime();
    const fim = new Date(custom.fim).getTime() + 24 * 60 * 60 * 1000 - 1;
    return lista.filter(x => {
      const t = new Date(x[campoData]).getTime();
      return t >= ini && t <= fim;
    });
  }
  return lista;
}

function RelatoriosScreen({ userData, onVoltar }) {
  const [periodo, setPeriodo] = useState("7");
  const [custom, setCustom] = useState({ inicio: "", fim: "" });

  const glicemias = filtrarPorPeriodo(userData.glicemias || [], "dataHora", periodo, custom);
  const refeicoes = filtrarPorPeriodo(userData.refeicoes || [], "dataHora", periodo, custom);
  const agua = filtrarPorPeriodo(userData.agua || [], "dataHora", periodo, custom);

  const valores = glicemias.map(g => g.valor);
  const mediaGli = valores.length ? round1(valores.reduce((a, b) => a + b, 0) / valores.length) : null;
  const minGli = valores.length ? Math.min(...valores) : null;
  const maxGli = valores.length ? Math.max(...valores) : null;

  const rangesRel = getRangesDoUsuario(userData.perfil);
  const barData = [...glicemias].sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora)).map(g => ({
    label: fmtData(g.dataHora).slice(0, 5), valor: g.valor, cor: classificarGlicemia(g.valor, rangesRel).color
  }));

  const totalCarb = refeicoes.reduce((s, r) => s + (r.totais?.carb || 0), 0);
  const totalKcal = refeicoes.reduce((s, r) => s + (r.totais?.kcal || 0), 0);
  const totalProt = refeicoes.reduce((s, r) => s + (r.totais?.prot || 0), 0);
  const totalGord = refeicoes.reduce((s, r) => s + (r.totais?.gord || 0), 0);
  const totalFibra = refeicoes.reduce((s, r) => s + (r.totais?.fibra || 0), 0);
  const mediaCarbPorRefeicao = refeicoes.length ? round1(totalCarb / refeicoes.length) : 0;

  const diasNoPeriodo = periodo === "7" ? 7 : periodo === "30" ? 30 : (
    custom.inicio && custom.fim ? Math.max(1, Math.round((new Date(custom.fim) - new Date(custom.inicio)) / 86400000) + 1) : 1
  );
  const totalAgua = agua.reduce((s, a) => s + a.ml, 0);
  const mediaAguaDia = round1(totalAgua / diasNoPeriodo);
  const diasComRegistroAgua = new Set(agua.map(a => fmtData(a.dataHora))).size;
  const metaAgua = userData.perfil.metaAguaMl || 2000;
  const aguaPorDia = {};
  agua.forEach(a => { const d = fmtData(a.dataHora); aguaPorDia[d] = (aguaPorDia[d] || 0) + a.ml; });
  const diasMetaAlcancada = Object.values(aguaPorDia).filter(v => v >= metaAgua).length;

  // Análise educativa (relação refeições x glicemia) — nunca afirma causalidade
  const relacao = useMemo(() => {
    if (glicemias.length < 3 || refeicoes.length < 3) return null;
    let altosAposCarb = 0, comparacoes = 0;
    glicemias.forEach(g => {
      const tG = new Date(g.dataHora).getTime();
      const refPrevia = refeicoes.filter(r => {
        const tR = new Date(r.dataHora).getTime();
        return tG - tR > 0 && tG - tR <= 3 * 60 * 60 * 1000;
      }).sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora))[0];
      if (refPrevia) {
        comparacoes++;
        if ((refPrevia.totais.carb || 0) > 45 && g.valor > 160) altosAposCarb++;
      }
    });
    if (comparacoes < 2) return null;
    const pct = Math.round((altosAposCarb / comparacoes) * 100);
    return { comparacoes, altosAposCarb, pct };
  }, [glicemias, refeicoes]);

  return (
    <div>
      <TopBar title="Gráficos e Relatórios" onBack={onVoltar} />
      <div style={{ padding: "10px 18px 30px" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
          {[["7", "7 dias"], ["30", "30 dias"], ["custom", "Personalizado"]].map(([v, label]) => (
            <button key={v} onClick={() => setPeriodo(v)} style={{
              padding: "9px 16px", borderRadius: 20, border: `1.5px solid ${periodo === v ? COLORS.primary : COLORS.border}`,
              background: periodo === v ? COLORS.primary : "#fff", color: periodo === v ? "#fff" : COLORS.text,
              fontWeight: 700, fontSize: 14, cursor: "pointer"
            }}>{label}</button>
          ))}
        </div>
        {periodo === "custom" && (
          <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
            <TextInput type="date" value={custom.inicio} onChange={e => setCustom(c => ({ ...c, inicio: e.target.value }))} />
            <TextInput type="date" value={custom.fim} onChange={e => setCustom(c => ({ ...c, fim: e.target.value }))} />
          </div>
        )}

        <Card style={{ marginBottom: 16 }}>
          <SectionTitle Icon={Activity} color={COLORS.primary}>Glicemia</SectionTitle>
          {valores.length === 0 ? <EmptyState text="Sem registros de glicemia no período." /> : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 14, textAlign: "center" }}>
                <StatBox label="Registros" value={valores.length} />
                <StatBox label="Média" value={`${mediaGli}`} />
                <StatBox label="Mínimo" value={minGli} />
                <StatBox label="Máximo" value={maxGli} />
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={barData} margin={{ left: -22, right: 6 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EEEDE3" />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="valor" radius={[6, 6, 0, 0]}>
                    {barData.map((d, i) => <Cell key={i} fill={d.cor} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </>
          )}
        </Card>

        <Card style={{ marginBottom: 16 }}>
          <SectionTitle Icon={Utensils} color={COLORS.purple}>Alimentação</SectionTitle>
          {refeicoes.length === 0 ? <EmptyState text="Sem refeições registradas no período." /> : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
              <StatBox label="Refeições" value={refeicoes.length} />
              <StatBox label="Carboidratos totais" value={`${round1(totalCarb)} g`} />
              <StatBox label="Média carb/refeição" value={`${mediaCarbPorRefeicao} g`} />
              <StatBox label="Calorias" value={`${Math.round(totalKcal)} kcal`} />
              <StatBox label="Proteínas" value={`${round1(totalProt)} g`} />
              <StatBox label="Gorduras" value={`${round1(totalGord)} g`} />
              <StatBox label="Fibras" value={`${round1(totalFibra)} g`} />
            </div>
          )}
        </Card>

        <Card style={{ marginBottom: 16 }}>
          <SectionTitle Icon={Droplet} color={COLORS.blue}>Hidratação</SectionTitle>
          {agua.length === 0 ? <EmptyState text="Sem registros de água no período." /> : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
              <StatBox label="Consumo total" value={`${totalAgua} ml`} />
              <StatBox label="Média diária" value={`${mediaAguaDia} ml`} />
              <StatBox label="Dias com meta atingida" value={diasMetaAlcancada} />
              <StatBox label="Dias com registro" value={diasComRegistroAgua} />
            </div>
          )}
        </Card>

        <Card>
          <SectionTitle Icon={Info} color={COLORS.warn}>Relação entre alimentação e glicemia</SectionTitle>
          {relacao ? (
            <p style={{ fontSize: 15, lineHeight: 1.5, color: COLORS.text }}>
              Foi observado no seu histórico que, em {relacao.altosAposCarb} de {relacao.comparacoes} medições feitas
              até 3 horas após uma refeição com mais de 45g de carboidratos, a glicemia registrada ficou acima de 160 mg/dL
              ({relacao.pct}% dos casos). Isso <b>pode estar relacionado</b> ao tipo ou quantidade de alimentos consumidos,
              mas não indica causa isolada. Vale acompanhar esse padrão e conversar com seu profissional de saúde.
            </p>
          ) : (
            <p style={{ fontSize: 15, color: COLORS.textMuted }}>Continue registrando suas glicemias e refeições — quando houver dados suficientes, o GlyControl mostrará aqui padrões observados entre alimentação e glicemia.</p>
          )}
          <div style={{ height: 10 }} />
          <Disclaimer text="Estas informações são educativas e não indicam diagnóstico, causa ou tratamento. Consulte sempre seu médico ou nutricionista." />
        </Card>
      </div>
    </div>
  );
}

function SectionTitle({ Icon, color, children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
      <Icon size={20} color={color} />
      <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>{children}</h3>
    </div>
  );
}

function StatBox({ label, value }) {
  return (
    <div style={{ background: COLORS.bg, borderRadius: 12, padding: "10px 6px" }}>
      <div style={{ fontSize: 18, fontWeight: 900, color: COLORS.text }}>{value ?? "—"}</div>
      <div style={{ fontSize: 11.5, color: COLORS.textMuted, fontWeight: 700, marginTop: 2 }}>{label}</div>
    </div>
  );
}

/* ============================================================
   ANA — assistente de chat do GlyControl (IA real)
   ------------------------------------------------------------
   Os NÚMEROS nunca vêm da IA: tudo que é cálculo (glicemia,
   nutrientes, médias, hidratação) é resolvido aqui em código e
   entregue pronto para a IA como um resumo de contexto. A IA só
   interpreta e conversa a partir desses dados já calculados —
   ela nunca "lembra" nem inventa números.
   Situações de risco (sintomas de hipo/hiperglicemia) NUNCA
   esperam a IA: são respondidas na hora, por regra determinística,
   para garantir uma orientação de segurança sempre correta.
   ============================================================ */

/* Resumo compacto e 100% calculado dos dados do usuário, enviado
   como contexto para a IA interpretar (nunca para ela recalcular). */
function montarContextoParaIA(userData) {
  const glicemias = userData.glicemias || [];
  const refeicoes = userData.refeicoes || [];
  const agua = userData.agua || [];
  const ranges = getRangesDoUsuario(userData.perfil);
  const hoje = new Date();

  const ultima = [...glicemias].sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora))[0];
  const linhas = [];
  linhas.push(`Nome do usuário: ${userData.perfil.nome || "não informado"}, ${userData.perfil.idade || "?"} anos.`);
  linhas.push(`Meta glicêmica pessoal cadastrada: ${ranges.adequadoMin}-${ranges.adequadoMax} mg/dL.`);

  if (ultima) {
    const c = classificarGlicemia(ultima.valor, ranges);
    linhas.push(`Última glicemia registrada: ${ultima.valor} mg/dL (${c.label}), em ${fmtDataHora(ultima.dataHora)}, contexto: ${ultima.contexto || "não informado"}.`);
  } else {
    linhas.push("Ainda não há nenhum registro de glicemia.");
  }

  const recentes7 = glicemias.filter(g => withinDays(g.dataHora, 7));
  if (recentes7.length > 0) {
    const media = round1(recentes7.reduce((s, g) => s + g.valor, 0) / recentes7.length);
    linhas.push(`Média de glicemia nos últimos 7 dias: ${media} mg/dL, com ${recentes7.length} registro(s).`);
  }

  const refHoje = refeicoes.filter(r => isSameDay(r.dataHora, hoje));
  if (refHoje.length > 0) {
    const tot = somarNutrientes(refHoje);
    linhas.push(`Refeições de hoje (${refHoje.map(r => r.tipo).join(", ")}): aproximadamente ${Math.round(tot.kcal)} kcal e ${round1(tot.carb)}g de carboidratos no total.`);
  } else {
    linhas.push("Nenhuma refeição registrada hoje.");
  }

  const aguaHoje = agua.filter(a => isSameDay(a.dataHora, hoje)).reduce((s, a) => s + a.ml, 0);
  const metaAgua = userData.perfil.metaAguaMl || 2000;
  linhas.push(`Água hoje: ${aguaHoje} ml de uma meta de ${metaAgua} ml.`);

  return linhas.join("\n");
}

/* Caminho de segurança: se a mensagem sugerir sintomas de
   hipo/hiperglicemia, respondemos na hora com regra determinística,
   sem esperar (nem depender d) a IA. */
function respostaSeguraSintomas(pergunta, userData) {
  const p = pergunta.toLowerCase();
  if (!/(mal|ruim|tontura|tonto|tonta|tremendo|tremor|suor|fraco|fraca|enjo|passando mal|desmaia)/.test(p)) return null;
  const glicemias = userData.glicemias || [];
  const ultima = [...glicemias].sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora))[0];
  const ranges = getRangesDoUsuario(userData.perfil);
  const c = ultima ? classificarGlicemia(ultima.valor, ranges) : null;
  const disclaimer = " Lembre-se: sou apenas educativa e não substituo seu médico ou nutricionista.";
  if (c && c.label === "Perigoso" && ultima.valor <= ranges.perigosoBaixo) {
    return `Sinto muito que você esteja se sentindo assim. Como sua última glicemia (${ultima.valor} mg/dL) está muito baixa, considere consumir agora algo com açúcar de ação rápida, como um suco ou uma colher de mel, e avise alguém de confiança. Se não melhorar em alguns minutos ou os sintomas piorarem, procure atendimento médico imediatamente.${disclaimer}`;
  }
  if (c && c.label === "Perigoso") {
    return `Sinto muito que você esteja se sentindo assim. Sua última glicemia (${ultima.valor} mg/dL) está bem alta. Beba água, evite doces agora, e entre em contato com seu médico caso os sintomas continuem.${disclaimer}`;
  }
  return `Sinto muito que você esteja se sentindo assim. Se os sintomas persistirem ou piorarem, procure atendimento médico. Quer me contar um pouco mais sobre como está se sentindo, ou registrar sua glicemia agora?`;
}

const SYSTEM_PROMPT_ANA = `Você é a Ana, assistente educativa do GlyControl, um app para idosos com Diabetes Mellitus tipo 2 acompanharem glicemia, alimentação e água.

REGRAS OBRIGATÓRIAS:
- Você NUNCA diagnostica, nunca ajusta medicação, nunca sugere dose de insulina, nunca manda suspender ou iniciar medicamento.
- Você NUNCA prevê um valor futuro de glicemia (nunca diga algo como "sua glicemia vai ficar em X depois dessa refeição"). Você só pode comentar registros REAIS já feitos pelo usuário.
- Use APENAS os números fornecidos no contexto abaixo. Nunca invente ou "lembre" valores — se não tiver o dado, diga que não tem esse registro ainda.
- Fale em português do Brasil simples, frases curtas, linguagem acessível para idosos.
- Respostas de no máximo 3-4 frases.
- Sempre que fizer sentido, lembre gentilmente que você é educativa e não substitui médico ou nutricionista.
- Se o usuário relatar sintomas preocupantes (tontura, mal-estar, suor frio, tremores), oriente com cautela e sugira procurar ajuda médica se necessário — mas isso normalmente já é tratado antes de chegar até você.

CONTEXTO ATUAL DO USUÁRIO (já calculado, não recalcule nada):
`;

/* Tenta o backend LOCAL do projeto (server/index.js), que fala com a
   Groq guardando a chave em segredo (nunca no navegador). Só funciona
   quando o usuário roda "npm run server" no computador dele — fora
   disso, a chamada falha rápido (404/erro de rede) e o chamador
   (gerarRespostaChatIA) segue para a próxima opção. */
async function tentarBackendLocal(system, mensagensAPI) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ system, messages: mensagensAPI }),
  });
  if (!response.ok) throw new Error("Backend local indisponível");
  const data = await response.json();
  const texto = (data.texto || "").trim();
  if (!texto) throw new Error("Resposta vazia do backend local");
  return texto;
}

/* Tenta o proxy de IA embutido do ambiente Claude Artifacts — só
   existe quando o GlyControl está rodando dentro de um Artifact do
   Claude.ai (não funciona rodando localmente pelo VS Code, pois ali
   não há autenticação/proxy do Claude.ai disponível no navegador). */
async function tentarProxyArtifacts(system, mensagensAPI) {
  const response = await fetch("https://mediumblue-grouse-339635.hostingersite.com/api/chat, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      system,
      messages: mensagensAPI,   
});
  if (!response.ok) throw new Error("Falha na resposta da IA (Artifacts)");
  const data = await response.json();
  const texto = (data.content || [])
    .filter(b => b.type === "text")
    .map(b => b.text)
    .join("\n")
    .trim();
  if (!texto) throw new Error("Resposta vazia (Artifacts)");
  return texto;
}

async function gerarRespostaChatIA(pergunta, historico, userData) {
  const seguranca = respostaSeguraSintomas(pergunta, userData);
  if (seguranca) return seguranca;

  const contexto = montarContextoParaIA(userData);
  const system = SYSTEM_PROMPT_ANA + contexto;
  const mensagensAPI = [];
  const ultimasTrocas = (historico || []).filter(m => m.pergunta).slice(-6);
  for (const m of ultimasTrocas) {
    mensagensAPI.push({ role: "user", content: m.pergunta });
    mensagensAPI.push({ role: "assistant", content: m.resposta });
  }
  mensagensAPI.push({ role: "user", content: pergunta });

  // Ordem de tentativas, cada uma cobrindo um jeito diferente de
  // rodar o GlyControl, sempre com fallback para a próxima:
  //   1. Backend local com Groq (rodando o projeto pelo VS Code)
  //   2. Proxy de IA do Claude Artifacts (rodando dentro do Claude.ai)
  //   3. Respostas locais por regra (nunca deixa o chat quebrado)
  try {
    return await tentarBackendLocal(system, mensagensAPI);
  } catch (e1) {
    try {
      return await tentarProxyArtifacts(system, mensagensAPI);
    } catch (e2) {
      return gerarRespostaChat(pergunta, userData);
    }
  }
}

/* Respostas locais por regra — usadas como reserva caso a IA falhe,
   e também no caminho de segurança. */
function gerarRespostaChat(pergunta, userData) {
  const p = pergunta.toLowerCase();
  const glicemias = userData.glicemias || [];
  const refeicoes = userData.refeicoes || [];
  const agua = userData.agua || [];

  const disclaimer = " Lembre-se: sou apenas educativa e não substituo seu médico ou nutricionista.";

  if (/(oi|olá|ola|bom dia|boa tarde|boa noite)/.test(p) && p.length < 25) {

    return `Olá! Eu sou a Ana, assistente do GlyControl. Posso te ajudar a entender seus registros de glicemia, alimentação e água, ou explicar como usar o sistema. O que você gostaria de saber?`;
  }

  // Como a pessoa está se sentindo / resposta a uma mensagem proativa sobre glicemia de risco
  if (/(mal|ruim|tontura|tonto|tonta|tremendo|tremor|suor|fraco|fraca|enjo|passando mal)/.test(p)) {
    const ultima = [...glicemias].sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora))[0];
    const rangesChat = getRangesDoUsuario(userData.perfil);
    const c = ultima ? classificarGlicemia(ultima.valor, rangesChat) : null;
    if (c && c.label === "Perigoso" && ultima.valor <= rangesChat.perigosoBaixo) {
      return `Sinto muito que você esteja se sentindo assim. Como sua última glicemia (${ultima.valor} mg/dL) está muito baixa, considere consumir agora algo com açúcar de ação rápida, como um suco ou uma colher de mel, e avise alguém de confiança. Se não melhorar em alguns minutos ou os sintomas piorarem, procure atendimento médico imediatamente.${disclaimer}`;
    }
    if (c && c.label === "Perigoso") {
      return `Sinto muito que você esteja se sentindo assim. Sua última glicemia (${ultima.valor} mg/dL) está bem alta. Beba água, evite doces agora, e entre em contato com seu médico caso os sintomas continuem.${disclaimer}`;
    }
    return `Sinto muito que você esteja se sentindo assim. Se os sintomas persistirem ou piorarem, procure atendimento médico. Quer me contar um pouco mais sobre como está se sentindo, ou registrar sua glicemia agora?`;
  }

  if (/(estou bem|tô bem|to bem|melhor agora|já melhorei|passou)/.test(p)) {
    return `Que bom saber! Continue se cuidando e não deixe de registrar sua próxima glicemia para acompanharmos juntos.`;
  }

  if (/aliment.*hoje|comi hoje|refeiç.*hoje/.test(p)) {
    const hoje = refeicoes.filter(r => isSameDay(r.dataHora, new Date()));
    if (hoje.length === 0) return "Você ainda não registrou nenhuma refeição hoje. Que tal registrar sua próxima refeição na aba Comida?";
    const tot = somarNutrientes(hoje);
    return `Hoje você registrou ${hoje.length} refeição(ões): ${hoje.map(r => r.tipo).join(", ")}. No total foram aproximadamente ${Math.round(tot.kcal)} kcal e ${round1(tot.carb)}g de carboidratos.${disclaimer}`;
  }

  if (/carboidrato.*almoço|almoço.*carboidrato/.test(p)) {
    const almocos = refeicoes.filter(r => r.tipo === "Almoço" && isSameDay(r.dataHora, new Date()));
    if (almocos.length === 0) return "Não encontrei um almoço registrado hoje. Você pode registrá-lo na aba Comida.";
    const tot = somarNutrientes(almocos);
    return `No seu almoço de hoje, você consumiu aproximadamente ${round1(tot.carb)}g de carboidratos.`;
  }

  if (/glicemia.*(7 dias|semana)|semana.*glicemia/.test(p)) {
    const recentes = glicemias.filter(g => withinDays(g.dataHora, 7));
    if (recentes.length === 0) return "Não encontrei registros de glicemia nos últimos 7 dias. Que tal registrar sua próxima medição?";
    const media = round1(recentes.reduce((s, g) => s + g.valor, 0) / recentes.length);
    const min = Math.min(...recentes.map(g => g.valor));
    const max = Math.max(...recentes.map(g => g.valor));
    return `Nos últimos 7 dias você tem ${recentes.length} registro(s) de glicemia, com média de ${media} mg/dL (mínimo ${min}, máximo ${max}).${disclaimer}`;
  }

  if (/glicemia|glicêmico|glicemico/.test(p)) {
    const ultima = [...glicemias].sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora))[0];
    if (!ultima) return "Você ainda não tem registros de glicemia. Registre sua primeira medição na aba Glicemia.";
    const c = classificarGlicemia(ultima.valor, getRangesDoUsuario(userData.perfil));
    let extra = "";
    if (c.label === "Perigoso") extra = " Esse valor está fora da faixa esperada — se estiver sentindo algo diferente, procure orientação médica.";
    else if (c.label === "Atenção") extra = " Vale ficar de olho e observar como você está se sentindo.";
    return `Seu último registro de glicemia foi ${ultima.valor} mg/dL (${c.label}), em ${fmtDataHora(ultima.dataHora)}.${extra}${disclaimer}`;
  }

  if (/água|agua/.test(p)) {
    const hoje = agua.filter(a => isSameDay(a.dataHora, new Date()));
    const total = hoje.reduce((s, a) => s + a.ml, 0);
    const meta = userData.perfil.metaAguaMl || 2000;
    return `Hoje você já consumiu ${total} ml de água, de uma meta de ${meta} ml. ${total >= meta ? "Parabéns, você atingiu sua meta! 🎉" : `Faltam ${meta - total} ml para atingir sua meta.`}`;
  }

  if (/como (registrar|faço|funciona).*cadastro/.test(p)) {
    return "Para se cadastrar, toque em 'Fazer conta' na tela de login e preencha nome, e-mail, senha e idade.";
  }
  if (/como (registrar|faço).*glicemia/.test(p)) {
    return "Toque em 'Glicemia' no menu inferior, depois em 'Novo registro'. Informe o valor em mg/dL, a data, o horário e o contexto da medição (jejum, antes/depois das refeições etc).";
  }
  if (/como (registrar|faço|usar).*(refeiç|comida|aliment)/.test(p)) {
    return "Toque em 'Comida' no menu inferior, escolha o tipo de refeição, pesquise os alimentos e informe a quantidade em gramas. O GlyControl calcula os nutrientes automaticamente.";
  }
  if (/carboidrato/.test(p)) {
    return "Carboidratos são o nutriente que mais influencia a glicemia. No GlyControl, cada alimento pesquisado mostra a quantidade de carboidratos por porção, para te ajudar a acompanhar sua alimentação.";
  }
  if (/relatório|relatorio|gráfico|grafico/.test(p)) {
    return "Na aba 'Mais' você encontra 'Relatórios', com gráficos e médias de glicemia, alimentação e hidratação por período (7 dias, 30 dias ou personalizado).";
  }

  return `Posso te ajudar com informações sobre sua glicemia, alimentação, hidratação ou sobre como usar o GlyControl. Pergunte, por exemplo: "Como foi minha alimentação hoje?" ou "Como está minha glicemia essa semana?".${disclaimer}`;
}

/* Mensagem que a Ana envia por conta própria (sem o usuário perguntar)
   quando um novo registro de glicemia cai nas faixas de Atenção ou
   Perigoso, convidando a pessoa a conversar sobre o que está sentindo. */
function gerarMensagemProativaGlicemia(registro, perfil) {
  const ranges = getRangesDoUsuario(perfil);
  const c = classificarGlicemia(registro.valor, ranges);
  if (c.label === "Perigoso" && registro.valor <= ranges.perigosoBaixo) {
    return `Oi, aqui é a Ana. Vi que seu registro de glicemia agora ficou em ${registro.valor} mg/dL, um valor muito baixo. Você está sentindo tontura, suor frio, tremores ou fraqueza? Se sim, considere consumir algo com açúcar de ação rápida agora e avise alguém de confiança. Como você está se sentindo?`;
  }
  if (c.label === "Perigoso") {
    return `Oi, aqui é a Ana. Vi que seu registro de glicemia agora ficou em ${registro.valor} mg/dL, um valor bem alto. Você tomou sua medicação hoje? Está bebendo água? Como você está se sentindo?`;
  }
  // Atenção
  return `Oi, aqui é a Ana. Vi que seu registro de glicemia (${registro.valor} mg/dL) ficou na faixa de atenção. Como você está se sentindo? Se quiser, me conta o que você comeu ou como foi seu dia — posso te ajudar a pensar nisso.`;
}

function ChatScreen({ userData, mensagens, onEnviar, onVoltar }) {
  const [texto, setTexto] = useState("");
  const [carregando, setCarregando] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [mensagens, carregando]);

  // "textoForcado" permite enviar direto um texto que ainda não passou
  // pelo estado (usado pelo botão de voz: a pessoa fala a pergunta e ela
  // já é enviada na hora, sem precisar apertar em "Enviar" depois).
  async function enviar(textoForcado) {
    const pergunta = (textoForcado ?? texto).trim();
    if (!pergunta || carregando) return;
    setTexto("");
    setCarregando(true);
    try {
      const resposta = await gerarRespostaChatIA(pergunta, mensagens, userData);
      onEnviar(pergunta, resposta);
    } finally {
      setCarregando(false);
    }
  }

  // Ao usar o microfone: mostra o texto reconhecido no campo (para a
  // pessoa conferir visualmente o que foi entendido) e já dispara o
  // envio da pergunta para a Ana, como pedido — "aperta, fala e já
  // lança a pergunta".
  function falarPergunta(textoFalado) {
    setTexto(textoFalado);
    enviar(textoFalado);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <TopBar title="Ana · Chat GlyControl" onBack={onVoltar} />
      <div style={{ flex: 1, overflowY: "auto", padding: "10px 18px" }}>
        {mensagens.length === 0 && (
          <div style={{ textAlign: "center", color: COLORS.textMuted, padding: "30px 10px", fontSize: 15 }}>
            Pergunte à Ana sobre sua glicemia, alimentação, água ou como usar o GlyControl.
          </div>
        )}
        {mensagens.map((m, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
            {m.pergunta && (
              <div style={{ alignSelf: "flex-end", background: COLORS.primary, color: "#fff", padding: "11px 15px", borderRadius: "16px 16px 4px 16px", maxWidth: "80%", fontSize: 15.5 }}>{m.pergunta}</div>
            )}
            <div style={{ alignSelf: "flex-start", maxWidth: "85%" }}>
              {m.proativa && <div style={{ fontSize: 12, fontWeight: 800, color: COLORS.warn, marginBottom: 3, marginLeft: 4 }}>Ana entrou em contato</div>}
              <div style={{
                background: m.proativa ? COLORS.warnBg : "#fff",
                border: `1px solid ${m.proativa ? "#EEDDA0" : COLORS.border}`,
                padding: "11px 15px", borderRadius: "16px 16px 16px 4px", fontSize: 15.5, lineHeight: 1.4
              }}>{m.resposta}</div>
            </div>
          </div>
        ))}
        {carregando && (
          <div style={{ alignSelf: "flex-start", maxWidth: "60%", marginBottom: 14 }}>
            <div style={{ background: "#fff", border: `1px solid ${COLORS.border}`, padding: "11px 15px", borderRadius: "16px 16px 16px 4px", fontSize: 15, color: COLORS.textMuted }}>
              Ana está digitando...
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div style={{ display: "flex", gap: 10, padding: "12px 18px", borderTop: `1px solid ${COLORS.border}`, background: "#fff" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <TextInput value={texto} onChange={e => setTexto(e.target.value)} placeholder="Escreva ou toque no microfone para falar..."
            onKeyDown={e => e.key === "Enter" && enviar()} style={{ paddingRight: 46 }} disabled={carregando} />
          {!carregando && <VoiceSearchButton onResult={falarPergunta} label="Perguntar por voz para a Ana" />}
        </div>
        <button onClick={() => enviar()} disabled={carregando} style={{ background: COLORS.primary, border: "none", borderRadius: 12, width: 50, height: 50, display: "flex", alignItems: "center", justifyContent: "center", cursor: carregando ? "not-allowed" : "pointer", flexShrink: 0, opacity: carregando ? 0.6 : 1 }}>
          <Send size={22} color="#fff" />
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   COMUNIDADE — Feed local (dados compartilhados entre usuários
   do protótipo via window.storage com shared=true)
   ============================================================ */

function ComunidadeScreen({ perfil, posts, onPublicar, onCurtir, onVoltar }) {
  const [texto, setTexto] = useState("");
  const [busca, setBusca] = useState("");

  const filtrados = posts.filter(p => !busca.trim() || p.conteudo.toLowerCase().includes(busca.toLowerCase()));
  const ordenados = [...filtrados].sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm));

  function publicar() {
    if (!texto.trim()) return;
    onPublicar(texto.trim());
    setTexto("");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <TopBar title="Comunidade" onBack={onVoltar} />
      <div style={{ padding: "8px 18px" }}>
        <div style={{ position: "relative", marginBottom: 6 }}>
          <Search size={20} style={{ position: "absolute", left: 14, top: 14, color: COLORS.textMuted }} />
          <TextInput value={busca} onChange={e => setBusca(e.target.value)} placeholder="Pesquisar publicações..." style={{ paddingLeft: 44, paddingRight: 46 }} />
          <VoiceSearchButton onResult={texto => setBusca(texto)} label="Pesquisar por voz" />
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "6px 18px" }}>
        {ordenados.length === 0 ? (
          <EmptyState icon={Users} text="Nenhuma publicação ainda. Seja o(a) primeiro(a) a compartilhar!" />
        ) : ordenados.map(post => (
          <Card key={post.id} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", gap: 10 }}>
              <Avatar nome={post.autorNome} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 15 }}>{post.autorNome}</div>
                <div style={{ fontSize: 15, margin: "4px 0", lineHeight: 1.4 }}>{post.conteudo}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 6 }}>
                  <span style={{ fontSize: 12.5, color: COLORS.textMuted }}>{tempoRelativo(post.criadoEm)}</span>
                  <button onClick={() => onCurtir(post.id)} style={{ background: "none", border: "none", display: "flex", alignItems: "center", gap: 5, cursor: "pointer", color: post.curtidoPor?.includes(perfil.email) ? COLORS.danger : COLORS.textMuted }}>
                    <Heart size={16} fill={post.curtidoPor?.includes(perfil.email) ? COLORS.danger : "none"} /> {post.curtidas || 0}
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10, padding: "12px 18px", borderTop: `1px solid ${COLORS.border}`, background: "#fff" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <TextInput value={texto} onChange={e => setTexto(e.target.value)} placeholder="Escreva ou toque no microfone para falar..."
            onKeyDown={e => e.key === "Enter" && publicar()} style={{ paddingRight: 46 }} />
          <VoiceSearchButton onResult={texto => setTexto(texto)} label="Escrever publicação por voz" />
        </div>
        <button onClick={publicar} style={{ background: COLORS.primary, border: "none", borderRadius: 12, width: 50, height: 50, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
          <Send size={22} color="#fff" />
        </button>
      </div>
    </div>
  );
}

function Avatar({ nome }) {
  const inicial = (nome || "?").trim()[0]?.toUpperCase() || "?";
  return (
    <div style={{
      width: 42, height: 42, borderRadius: 21, background: COLORS.primaryLight, color: COLORS.primaryDark,
      display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 17, flexShrink: 0
    }}>{inicial}</div>
  );
}

function tempoRelativo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `${min} min atrás`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h atrás`;
  const d = Math.floor(h / 24);
  return `${d}d atrás`;
}

/* ============================================================
   PERFIL E CONFIGURAÇÕES
   ============================================================ */

function PerfilScreen({ userData, onSalvarPerfil, onSair, onExcluirConta, onVoltar, onNavigate }) {
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState(userData.perfil.nome);
  const [idade, setIdade] = useState(userData.perfil.idade);
  const [sexo, setSexo] = useState(userData.perfil.sexo);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const [editandoMeta, setEditandoMeta] = useState(false);
  const [metaMin, setMetaMin] = useState(userData.perfil.metaGlicemiaMin || 80);
  const [metaMax, setMetaMax] = useState(userData.perfil.metaGlicemiaMax || 130);
  const [erroMeta, setErroMeta] = useState("");

  function salvar() {
    onSalvarPerfil({ ...userData.perfil, nome, idade, sexo });
    setEditando(false);
  }

  function salvarMeta() {
    const min = Number(metaMin), max = Number(metaMax);
    if (!min || !max || min <= 0 || max <= 0 || min >= max || max > 400) {
      setErroMeta("Informe uma faixa válida (o valor mínimo deve ser menor que o máximo).");
      return;
    }
    onSalvarPerfil({ ...userData.perfil, metaGlicemiaMin: min, metaGlicemiaMax: max });
    setErroMeta("");
    setEditandoMeta(false);
  }

  const escalas = [
    { label: "A-", value: 0.9 }, { label: "A", value: 1 }, { label: "A+", value: 1.15 }, { label: "A++", value: 1.3 },
  ];

  return (
    <div>
      <TopBar title="Perfil" onBack={onVoltar} />
      <div style={{ padding: "10px 18px 34px" }}>
        <Card style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 14 }}>
            <div style={{ width: 64, height: 64, borderRadius: 32, background: COLORS.primaryLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <User size={32} color={COLORS.primary} />
            </div>
            <div style={{ flex: 1 }}>
              {editando ? (
                <div style={{ position: "relative", marginBottom: 6 }}>
                  <TextInput value={nome} onChange={e => setNome(e.target.value)} style={{ paddingRight: 46 }} />
                  <VoiceSearchButton onResult={texto => setNome(texto)} label="Falar o nome" />
                </div>
              ) : (
                <div style={{ fontWeight: 900, fontSize: 20 }}>{userData.perfil.nome}</div>
              )}
              <div style={{ fontSize: 14, color: COLORS.textMuted }}>{userData.perfil.idade ? `${userData.perfil.idade} anos · ` : ""}{userData.perfil.sexo}</div>
            </div>
            <button onClick={() => editando ? salvar() : setEditando(true)} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.primary }}>
              {editando ? <Check size={22} /> : <Edit2 size={20} />}
            </button>
          </div>
          {editando && (
            <div style={{ display: "flex", gap: 10, marginBottom: 4 }}>
              <TextInput type="number" value={idade} onChange={e => setIdade(e.target.value)} placeholder="Idade" style={{ flex: 1 }} />
              <Select value={sexo} onChange={e => setSexo(e.target.value)} options={["Feminino", "Masculino", "Não quero informar"]} />
            </div>
          )}
          <div style={{ fontSize: 15, color: COLORS.text, paddingTop: 10, borderTop: `1px solid ${COLORS.border}`, marginTop: 6 }}>{userData.perfil.email}</div>
        </Card>

        <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 10 }}>Tamanho da letra</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
          {escalas.map(e => (
            <button key={e.label} onClick={() => onSalvarPerfil({ ...userData.perfil, fontScale: e.value })}
              style={{
                flex: 1, padding: "12px 0", borderRadius: 12, fontWeight: 800, cursor: "pointer",
                border: `1.5px solid ${userData.perfil.fontScale === e.value ? COLORS.primary : COLORS.border}`,
                background: userData.perfil.fontScale === e.value ? COLORS.primary : "#fff",
                color: userData.perfil.fontScale === e.value ? "#fff" : COLORS.text, fontSize: 15,
              }}>{e.label}</button>
          ))}
        </div>

        <Card style={{ marginBottom: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: editandoMeta ? 12 : 0 }}>
            <div style={{ fontWeight: 800, fontSize: 15 }}>Sua meta de glicemia</div>
            <button onClick={() => editandoMeta ? salvarMeta() : setEditandoMeta(true)} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.primary }}>
              {editandoMeta ? <Check size={22} /> : <Edit2 size={20} />}
            </button>
          </div>
          {!editandoMeta ? (
            <div style={{ fontSize: 15, color: COLORS.text }}>
              {userData.perfil.metaGlicemiaMin || 80} – {userData.perfil.metaGlicemiaMax || 130} mg/dL
              <div style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 4 }}>Essa é a sua faixa considerada adequada. Ela pode ser diferente da de outras pessoas — combine com seu médico.</div>
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <TextInput type="number" value={metaMin} onChange={e => setMetaMin(e.target.value)} placeholder="Mínimo" style={{ flex: 1, textAlign: "center" }} />
                <span style={{ fontWeight: 800, color: COLORS.textMuted }}>até</span>
                <TextInput type="number" value={metaMax} onChange={e => setMetaMax(e.target.value)} placeholder="Máximo" style={{ flex: 1, textAlign: "center" }} />
              </div>
              {erroMeta && <div style={{ color: COLORS.danger, fontSize: 13.5, marginTop: 8, fontWeight: 700 }}>{erroMeta}</div>}
              <div style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 8 }}>Use os valores que seu médico indicou como sua meta pessoal. Isso muda as cores e recomendações do app para você.</div>
            </div>
          )}
        </Card>

        <MenuRow Icon={Activity} label="Histórico de Glicemia" onClick={() => onNavigate("historicoGlicemia")} />
        <MenuRow Icon={Utensils} label="Alimentação" onClick={() => onNavigate("alimentacao")} />
        <MenuRow Icon={Droplet} label="Água" onClick={() => onNavigate("agua")} />
        <MenuRow Icon={Salad} label="Trocas Alimentares" onClick={() => onNavigate("trocas")} />
        <MenuRow Icon={BarChart2} label="Gráficos e Relatórios" onClick={() => onNavigate("relatorios")} />
        <MenuRow Icon={Users} label="Comunidade" onClick={() => onNavigate("comunidade")} />
        <MenuRow Icon={HelpCircle} label="Ajuda" onClick={() => onNavigate("ajuda")} />
        <MenuRow Icon={ShieldCheck} label="Segurança e LGPD" onClick={() => onNavigate("seguranca")} />
        <MenuRow Icon={FileText} label="Política de Privacidade" onClick={() => onNavigate("privacidade")} />
        <MenuRow Icon={Accessibility} label="Declaração de Acessibilidade" onClick={() => onNavigate("acessibilidade")} />

        <div style={{ height: 20 }} />
        <Btn variant="outline" icon={LogOut} onClick={onSair}>Sair da conta</Btn>
        <div style={{ height: 12 }} />
        {!confirmarExclusao ? (
          <Btn variant="danger" icon={Trash2} onClick={() => setConfirmarExclusao(true)}>Excluir minha conta</Btn>
        ) : (
          <Card style={{ borderColor: COLORS.danger }}>
            <p style={{ fontSize: 15, marginTop: 0 }}>Tem certeza? Todos os seus dados (glicemia, refeições, água) serão apagados permanentemente.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <Btn variant="outline" onClick={() => setConfirmarExclusao(false)}>Cancelar</Btn>
              <Btn variant="danger" onClick={onExcluirConta}>Confirmar exclusão</Btn>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function MenuRow({ Icon, label, onClick, danger }) {
  return (
    <button onClick={onClick} style={{
      width: "100%", display: "flex", alignItems: "center", gap: 12, background: "#fff",
      border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "15px 16px", marginBottom: 10,
      cursor: "pointer", textAlign: "left",
    }}>
      <Icon size={22} color={danger ? COLORS.danger : COLORS.primary} />
      <span style={{ flex: 1, fontSize: 16, fontWeight: 700, color: danger ? COLORS.danger : COLORS.text }}>{label}</span>
      <ChevronRight size={20} color={COLORS.textMuted} />
    </button>
  );
}

function StaticInfoScreen({ title, onVoltar, paragraphs }) {
  return (
    <div>
      <TopBar title={title} onBack={onVoltar} />
      <div style={{ padding: "14px 18px 34px" }}>
        {paragraphs.map((p, i) => (
          <p key={i} style={{ fontSize: 15.5, lineHeight: 1.6, color: COLORS.text }}>{p}</p>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   CALENDÁRIO
   ============================================================ */

const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

function CalendarioScreen({ userData, onVoltar }) {
  const [ref, setRef] = useState(new Date());
  const [diaSel, setDiaSel] = useState(new Date());

  const ano = ref.getFullYear(), mes = ref.getMonth();
  const primeiroDia = new Date(ano, mes, 1).getDay();
  const totalDias = new Date(ano, mes + 1, 0).getDate();

  const registrosPorDia = {};
  (userData.glicemias || []).forEach(g => {
    const d = new Date(g.dataHora);
    if (d.getFullYear() === ano && d.getMonth() === mes) {
      const dia = d.getDate();
      registrosPorDia[dia] = registrosPorDia[dia] || [];
      registrosPorDia[dia].push(g);
    }
  });

  const registrosDoDiaSel = (userData.glicemias || []).filter(g => isSameDay(g.dataHora, diaSel))
    .sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora));

  const dias = [];
  for (let i = 0; i < primeiroDia; i++) dias.push(null);
  for (let d = 1; d <= totalDias; d++) dias.push(d);

  return (
    <div>
      <TopBar title="Calendário" onBack={onVoltar} />
      <div style={{ padding: "10px 18px 30px" }}>
        <Card style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <button onClick={() => setRef(new Date(ano, mes - 1, 1))} style={iconCloseBtn}><ChevronLeft size={20} /></button>
            <div style={{ fontWeight: 800, fontSize: 17 }}>{MESES[mes]} {ano}</div>
            <button onClick={() => setRef(new Date(ano, mes + 1, 1))} style={iconCloseBtn}><ChevronRight size={20} /></button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 6 }}>
            {["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"].map(d => (
              <div key={d} style={{ textAlign: "center", fontSize: 11.5, fontWeight: 700, color: COLORS.textMuted }}>{d}</div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
            {dias.map((d, i) => {
              if (!d) return <div key={i} />;
              const dataObj = new Date(ano, mes, d);
              const isSel = isSameDay(dataObj, diaSel);
              const regs = registrosPorDia[d];
              let dotColor = null;
              if (regs && regs.length) dotColor = classificarGlicemia(regs[regs.length - 1].valor, getRangesDoUsuario(userData.perfil)).color;
              return (
                <button key={i} onClick={() => setDiaSel(dataObj)} style={{
                  aspectRatio: "1", borderRadius: "50%", border: "none", cursor: "pointer",
                  background: isSel ? COLORS.primary : "transparent",
                  color: isSel ? "#fff" : COLORS.text, fontWeight: isSel ? 800 : 600, fontSize: 14,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative"
                }}>
                  {d}
                  {dotColor && <div style={{ width: 5, height: 5, borderRadius: 3, background: isSel ? "#fff" : dotColor, marginTop: 1 }} />}
                </button>
              );
            })}
          </div>
        </Card>

        <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 10 }}>Registros do dia {fmtData(diaSel)}</div>
        {registrosDoDiaSel.length === 0 ? (
          <EmptyState icon={Calendar} text="Nenhum registro neste dia." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {registrosDoDiaSel.map(g => {
              const c = classificarGlicemia(g.valor, getRangesDoUsuario(userData.perfil));
              return (
                <Card key={g.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 14 }}>
                  <span style={{ fontWeight: 700 }}>{fmtHora(g.dataHora)}</span>
                  <span style={{ fontWeight: 800 }}>{g.valor} mg/dL</span>
                  <div style={{ width: 12, height: 12, borderRadius: 6, background: c.color }} />
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   AJUDA
   ============================================================ */

const FAQ_ITEMS = [
  { q: "Como fazer meu cadastro", a: "Na tela inicial, toque em 'Fazer conta'. Preencha nome, e-mail, senha e idade, e toque em 'Continuar'." },
  { q: "Como registrar minha glicemia", a: "Toque em 'Glicemia' no menu inferior e depois em 'Novo registro'. Informe o valor, data, horário e o contexto da medição." },
  { q: "Alimentos e carboidratos", a: "Ao pesquisar um alimento na aba Comida, o GlyControl mostra os carboidratos e demais nutrientes por porção, calculados a partir da quantidade que você informar." },
  { q: "Como usar o chat", a: "Toque no ícone de Chat na tela inicial ou no menu. Escreva sua pergunta sobre seus registros ou sobre o funcionamento do GlyControl." },
  { q: "Como usar o calendário", a: "No calendário você pode navegar entre os meses e tocar em um dia para ver os registros de glicemia daquela data." },
  { q: "Relatórios e gráficos", a: "Em 'Mais' > 'Relatórios', escolha um período (7 dias, 30 dias ou personalizado) para ver médias, gráficos e resumos de glicemia, alimentação e água." },
  { q: "Privacidade e segurança", a: "Seus dados ficam salvos de forma local ao seu uso do GlyControl. Numa versão real, o sistema deverá seguir autenticação segura, criptografia e princípios da LGPD." },
  { q: "LGPD – Seus dados", a: "Você pode editar ou excluir seus dados a qualquer momento na tela de Perfil, em 'Excluir minha conta'." },
  { q: "Dúvidas frequentes", a: "Se sua dúvida não estiver aqui, use o Chat do GlyControl para perguntar diretamente." },
];

function AjudaScreen({ onVoltar }) {
  const [busca, setBusca] = useState("");
  const [aberto, setAberto] = useState(null);
  const filtrados = FAQ_ITEMS.filter(f => !busca.trim() || f.q.toLowerCase().includes(busca.toLowerCase()) || f.a.toLowerCase().includes(busca.toLowerCase()));
  return (
    <div>
      <TopBar title="Ajuda" onBack={onVoltar} />
      <div style={{ padding: "10px 18px 30px" }}>
        <div style={{ position: "relative", marginBottom: 16 }}>
          <Search size={20} style={{ position: "absolute", left: 14, top: 14, color: COLORS.textMuted }} />
          <TextInput value={busca} onChange={e => setBusca(e.target.value)} placeholder="O que você precisa?" style={{ paddingLeft: 44, paddingRight: 46 }} />
          <VoiceSearchButton onResult={texto => setBusca(texto)} label="Pesquisar por voz" />
        </div>
        {filtrados.map((f, i) => (
          <Card key={i} onClick={() => setAberto(aberto === i ? null : i)} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 700, fontSize: 16 }}>{f.q}</span>
              {aberto === i ? <ChevronUp size={20} color={COLORS.textMuted} /> : <ChevronDown size={20} color={COLORS.textMuted} />}
            </div>
            {aberto === i && <p style={{ fontSize: 15, color: COLORS.textMuted, marginBottom: 0, marginTop: 10, lineHeight: 1.5 }}>{f.a}</p>}
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   RECOMENDAÇÕES (educativas, geradas a partir dos registros)
   ============================================================ */

/* Escolhe aleatoriamente uma das variações de texto para o gatilho,
   para não repetir sempre a mesma frase (REC01 do Motor da IA). */
function escolherVariacaoRec(gatilho) {
  const textos = REC_BANK[gatilho];
  if (!textos || textos.length === 0) return null;
  return textos[Math.floor(Math.random() * textos.length)];
}

/* Metadados visuais (ícone/cor) e fonte de cada gatilho suportado. */
const GATILHO_META = {
  BALANCED_MEAL: { Icon: CheckCircle2, bg: "#E4F1E8", color: "#2C6E49", fonte: "American Diabetes Association" },
  NO_VEGETABLE: { Icon: Salad, bg: "#F1E9FB", color: "#7C4DBD", fonte: "American Diabetes Association" },
  NO_PROTEIN_SOURCE: { Icon: Utensils, bg: "#F1E9FB", color: "#7C4DBD", fonte: "American Diabetes Association" },
  NO_LEGUME: { Icon: Salad, bg: "#F1E9FB", color: "#7C4DBD", fonte: "Guia Alimentar para a População Brasileira" },
  LOW_FIBER: { Icon: Salad, bg: "#F1E9FB", color: "#7C4DBD", fonte: "Sociedade Brasileira de Diabetes" },
  FIBER_RICH: { Icon: CheckCircle2, bg: "#E4F1E8", color: "#2C6E49", fonte: "Sociedade Brasileira de Diabetes" },
  REFINED_CARB_DOMINANT: { Icon: AlertTriangle, bg: "#FBF3DA", color: "#D4A017", fonte: "Sociedade Brasileira de Diabetes" },
  SUGARY_DRINK: { Icon: AlertTriangle, bg: "#FBF3DA", color: "#D4A017", fonte: "Sociedade Brasileira de Diabetes" },
  JUICE_PRESENT: { Icon: AlertTriangle, bg: "#FBF3DA", color: "#D4A017", fonte: "Sociedade Brasileira de Diabetes" },
  ULTRAPROCESSED_MULTIPLE: { Icon: AlertTriangle, bg: "#FBF3DA", color: "#D4A017", fonte: "Sociedade Brasileira de Diabetes" },
  FRUIT_WHOLE_PRESENT: { Icon: CheckCircle2, bg: "#E4F1E8", color: "#2C6E49", fonte: "American Diabetes Association" },
  LEGUME_PRESENT: { Icon: CheckCircle2, bg: "#E4F1E8", color: "#2C6E49", fonte: "Guia Alimentar para a População Brasileira" },
  WHOLE_GRAIN_PRESENT: { Icon: CheckCircle2, bg: "#E4F1E8", color: "#2C6E49", fonte: "Sociedade Brasileira de Diabetes" },
  NUTS_PRESENT: { Icon: CheckCircle2, bg: "#E4F1E8", color: "#2C6E49", fonte: "American Diabetes Association" },
  WATER_LOW: { Icon: Droplet, bg: COLORS.blueBg, color: COLORS.blue, fonte: "Sociedade Brasileira de Diabetes" },
  WATER_GOAL: { Icon: Droplet, bg: COLORS.blueBg, color: COLORS.blue, fonte: "Sociedade Brasileira de Diabetes" },
  NO_WATER_LOGS: { Icon: Droplet, bg: COLORS.blueBg, color: COLORS.blue, fonte: "Sociedade Brasileira de Diabetes" },
  GLUCOSE_IN_PERSONAL_TARGET: { Icon: CheckCircle2, bg: "#E4F1E8", color: "#2C6E49", fonte: "Sociedade Brasileira de Diabetes" },
  SINGLE_ABOVE_PERSONAL_TARGET: { Icon: AlertTriangle, bg: "#FBF3DA", color: "#D4A017", fonte: "Sociedade Brasileira de Diabetes" },
  REPEATED_ABOVE_PERSONAL_TARGET: { Icon: AlertTriangle, bg: "#FBE7E5", color: "#C0392B", fonte: "Sociedade Brasileira de Diabetes — diabetes no idoso" },
  LOGGING_CONSISTENT: { Icon: CheckCircle2, bg: "#E4F1E8", color: "#2C6E49", fonte: "Ministério da Saúde" },
  LOGGING_GAPS: { Icon: Activity, bg: "#E4F1E8", color: "#2C6E49", fonte: "Ministério da Saúde" },
};

/* ============================================================
   MOTOR DE RECOMENDAÇÕES — determinístico
   ------------------------------------------------------------
   Regra de ouro (ver documento "Motor de Recomendações"):
   os CÁLCULOS (somas de nutrientes, médias, presença de tags) são
   feitos aqui em código puro, nunca por texto livre de IA. A única
   parte "inteligente" é escolher, entre variações prontas e
   revisadas, qual frase mostrar para cada gatilho identificado —
   isso evita alucinação e mantém segurança clínica.
   ============================================================ */
function gerarRecomendacoes(userData) {
  const glicemias = userData.glicemias || [];
  const refeicoes = userData.refeicoes || [];
  const agua = userData.agua || [];
  const hoje = new Date();
  const ranges = getRangesDoUsuario(userData.perfil);

  const ultima = [...glicemias].sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora))[0];

  /* SEGURANÇA PRIMEIRO: se a última glicemia estiver muito baixa,
     interrompemos as recomendações normais e mostramos apenas a
     orientação de segurança (regra 7 do documento). */
  if (ultima) {
    const c = classificarGlicemia(ultima.valor, ranges);
    if (c.label === "Perigoso" && ultima.valor <= ranges.perigosoBaixo) {
      return [{
        Icon: AlertTriangle, bg: "#FBE7E5", color: "#C0392B",
        texto: (escolherVariacaoRec("HYPO_LT70") || `Sua glicemia está muito baixa (${ultima.valor} mg/dL). Consuma algo com açúcar de ação rápida agora e procure ajuda se não melhorar.`).replace(/\d+ mg\/dL/, `${ultima.valor} mg/dL`),
        fonte: "Sociedade Brasileira de Diabetes",
        gatilho: "HYPO_LT70", somenteSeguranca: true,
      }];
    }
  }

  const recs = [];

  // Gatilho principal de glicemia, com meta individualizada
  if (ultima) {
    const c = classificarGlicemia(ultima.valor, ranges);
    if (c.label === "Perigoso") {
      recs.push({
        Icon: AlertTriangle, bg: "#FBE7E5", color: "#C0392B",
        texto: `Sua glicemia está acima da sua meta pessoal (${ultima.valor} mg/dL, meta ${ranges.adequadoMin}-${ranges.adequadoMax} mg/dL). Por isso, beber água e evitar doces agora pode ajudar. Se continuar alta, entre em contato com seu médico.`,
        fonte: "Sociedade Brasileira de Diabetes", gatilho: "REPEATED_ABOVE_PERSONAL_TARGET",
      });
    } else if (c.label === "Atenção") {
      const t = escolherVariacaoRec("SINGLE_ABOVE_PERSONAL_TARGET");
      recs.push({ ...GATILHO_META.SINGLE_ABOVE_PERSONAL_TARGET, texto: t || `Sua última glicemia (${ultima.valor} mg/dL) ficou um pouco acima da sua meta pessoal (${ranges.adequadoMin}-${ranges.adequadoMax} mg/dL).`, gatilho: "SINGLE_ABOVE_PERSONAL_TARGET" });
    } else {
      const t = escolherVariacaoRec("GLUCOSE_IN_PERSONAL_TARGET");
      recs.push({ ...GATILHO_META.GLUCOSE_IN_PERSONAL_TARGET, texto: t || `Sua glicemia (${ultima.valor} mg/dL) está dentro da sua meta pessoal (${ranges.adequadoMin}-${ranges.adequadoMax} mg/dL). Continue assim!`, gatilho: "GLUCOSE_IN_PERSONAL_TARGET" });
    }
  } else {
    recs.push({ Icon: Activity, bg: COLORS.primaryLight, color: COLORS.primary, texto: "Você ainda não registrou sua glicemia. Registrar regularmente ajuda a identificar como ela varia.", fonte: "Ministério da Saúde", gatilho: null });
  }

  // Hidratação
  const aguaHoje = agua.filter(a => isSameDay(a.dataHora, hoje)).reduce((s, a) => s + a.ml, 0);
  const metaAgua = userData.perfil.metaAguaMl || 2000;
  if (aguaHoje === 0) {
    recs.push({ ...GATILHO_META.NO_WATER_LOGS, texto: escolherVariacaoRec("NO_WATER_LOGS") || "Você ainda não registrou água hoje. Beber água ao longo do dia ajuda seu corpo a funcionar melhor.", gatilho: "NO_WATER_LOGS" });
  } else if (aguaHoje < metaAgua * 0.5) {
    recs.push({ ...GATILHO_META.WATER_LOW, texto: escolherVariacaoRec("WATER_LOW") || "Você está abaixo da metade da sua meta de água hoje. Beber mais líquido ajuda seu corpo a funcionar melhor.", gatilho: "WATER_LOW" });
  } else if (aguaHoje >= metaAgua) {
    recs.push({ ...GATILHO_META.WATER_GOAL, texto: escolherVariacaoRec("WATER_GOAL") || "Você atingiu sua meta de água hoje. Continue assim!", gatilho: "WATER_GOAL" });
  }

  // Composição da refeição mais recente (últimas 24h), via tags — cálculo determinístico
  const refRecentes = refeicoes.filter(r => withinDays(r.dataHora, 1));
  if (refRecentes.length > 0) {
    const ultimaRef = refRecentes[refRecentes.length - 1];
    const itens = ultimaRef.itens || [];
    const temVeg = refeicaoTemTag(itens, "non_starchy_vegetable");
    const temProt = refeicaoTemTag(itens, "lean_protein") || refeicaoTemTag(itens, "dairy");
    const temLegume = refeicaoTemTag(itens, "legume");
    const temFruta = refeicaoTemTag(itens, "fruit");
    const temIntegral = refeicaoTemTag(itens, "whole_grain");
    const temOleaginosa = refeicaoTemTag(itens, "nuts_seeds");
    const temAcucarada = refeicaoTemTag(itens, "sugary_drink");
    const qtdUltraprocessado = contarTagNaRefeicao(itens, "ultraprocessed");
    const fibraTotal = ultimaRef.totais?.fibra || 0;

    if (temVeg && temProt && !temAcucarada) {
      recs.push({ ...GATILHO_META.BALANCED_MEAL, texto: escolherVariacaoRec("BALANCED_MEAL"), gatilho: "BALANCED_MEAL" });
    }
    if (!temVeg) {
      recs.push({ ...GATILHO_META.NO_VEGETABLE, texto: escolherVariacaoRec("NO_VEGETABLE"), gatilho: "NO_VEGETABLE" });
    }
    if (temAcucarada) {
      recs.push({ ...GATILHO_META.SUGARY_DRINK, texto: escolherVariacaoRec("SUGARY_DRINK"), gatilho: "SUGARY_DRINK" });
    }
    if (qtdUltraprocessado >= 2) {
      recs.push({ ...GATILHO_META.ULTRAPROCESSED_MULTIPLE, texto: escolherVariacaoRec("ULTRAPROCESSED_MULTIPLE"), gatilho: "ULTRAPROCESSED_MULTIPLE" });
    }
    if (fibraTotal < 3) {
      recs.push({ ...GATILHO_META.LOW_FIBER, texto: escolherVariacaoRec("LOW_FIBER"), gatilho: "LOW_FIBER" });
    } else {
      recs.push({ ...GATILHO_META.FIBER_RICH, texto: escolherVariacaoRec("FIBER_RICH"), gatilho: "FIBER_RICH" });
    }
    if (temLegume) recs.push({ ...GATILHO_META.LEGUME_PRESENT, texto: escolherVariacaoRec("LEGUME_PRESENT"), gatilho: "LEGUME_PRESENT" });
    if (temFruta) recs.push({ ...GATILHO_META.FRUIT_WHOLE_PRESENT, texto: escolherVariacaoRec("FRUIT_WHOLE_PRESENT"), gatilho: "FRUIT_WHOLE_PRESENT" });
    if (temIntegral) recs.push({ ...GATILHO_META.WHOLE_GRAIN_PRESENT, texto: escolherVariacaoRec("WHOLE_GRAIN_PRESENT"), gatilho: "WHOLE_GRAIN_PRESENT" });
    if (temOleaginosa) recs.push({ ...GATILHO_META.NUTS_PRESENT, texto: escolherVariacaoRec("NUTS_PRESENT"), gatilho: "NUTS_PRESENT" });
  }

  // Consistência de registro
  const registrosUlt7 = glicemias.filter(g => withinDays(g.dataHora, 7));
  if (registrosUlt7.length < 3) {
    recs.push({ ...GATILHO_META.LOGGING_GAPS, texto: escolherVariacaoRec("LOGGING_GAPS") || "Você tem poucos registros de glicemia essa semana. Registrar com mais frequência ajuda a identificar padrões.", gatilho: "LOGGING_GAPS" });
  } else {
    recs.push({ ...GATILHO_META.LOGGING_CONSISTENT, texto: escolherVariacaoRec("LOGGING_CONSISTENT") || "Você tem mantido bons registros essa semana. Continue assim!", gatilho: "LOGGING_CONSISTENT" });
  }

  recs.push({ Icon: ShieldCheck, bg: COLORS.blueBg, color: COLORS.blue, texto: "Manter sua medicação em dia, conforme seu médico indicou, ajuda a manter sua glicemia sob controle.", fonte: "Ministério da Saúde", gatilho: null });

  return recs.filter(r => r.texto);
}

/* Explicação (gatilho -> "por que recebi esta recomendação?"),
   conforme a aba Explicação do documento de recomendações. */
const GATILHO_CONDICAO = {
  BALANCED_MEAL: "Sua refeição teve vegetais, proteína e fonte de carboidrato ao mesmo tempo.",
  NO_VEGETABLE: "Não identificamos nenhuma hortaliça ou vegetal não amiláceo na sua refeição.",
  SUGARY_DRINK: "Identificamos uma bebida açucarada na sua refeição.",
  ULTRAPROCESSED_MULTIPLE: "Vários alimentos ultraprocessados apareceram na mesma refeição.",
  LOW_FIBER: "A refeição teve poucas fontes de fibra (menos de 3g no total).",
  FIBER_RICH: "A refeição teve uma boa quantidade de fibra (3g ou mais).",
  LEGUME_PRESENT: "Você registrou feijão, lentilha, ervilha ou grão-de-bico.",
  FRUIT_WHOLE_PRESENT: "Você registrou uma fruta inteira.",
  WHOLE_GRAIN_PRESENT: "Você registrou um cereal integral.",
  NUTS_PRESENT: "Você registrou oleaginosas (castanhas, nozes, amêndoas).",
  WATER_LOW: "Você está abaixo da metade da sua meta diária de água.",
  WATER_GOAL: "Você atingiu sua meta diária de água.",
  NO_WATER_LOGS: "Você ainda não registrou nenhum consumo de água hoje.",
  GLUCOSE_IN_PERSONAL_TARGET: "Sua última glicemia está dentro da meta que você cadastrou no Perfil.",
  SINGLE_ABOVE_PERSONAL_TARGET: "Sua última glicemia ficou acima da meta que você cadastrou no Perfil.",
  REPEATED_ABOVE_PERSONAL_TARGET: "Sua última glicemia está bem acima da meta que você cadastrou no Perfil.",
  LOGGING_CONSISTENT: "Você registrou 3 ou mais medições de glicemia nos últimos 7 dias.",
  LOGGING_GAPS: "Você registrou menos de 3 medições de glicemia nos últimos 7 dias.",
  HYPO_LT70: "Sua última glicemia ficou abaixo da sua meta mínima — isso ativa um alerta de segurança.",
};

function RecomendacoesScreen({ userData, onVoltar }) {
  const recs = useMemo(() => gerarRecomendacoes(userData), [userData]);
  const ranges = getRangesDoUsuario(userData.perfil);
  const ultima = [...(userData.glicemias || [])].sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora))[0];
  const classi = ultima ? classificarGlicemia(ultima.valor, ranges) : null;
  const [abertaExplicacao, setAbertaExplicacao] = useState(null);
  return (
    <div>
      <TopBar title="Recomendações" onBack={onVoltar} />
      <div style={{ padding: "10px 18px 30px" }}>
        {classi && (
          <div style={{
            display: "flex", alignItems: "center", gap: 10, background: classi.bg, color: classi.color,
            borderRadius: 14, padding: "12px 16px", marginBottom: 16, fontWeight: 800, fontSize: 15,
          }}>
            <div style={{ width: 12, height: 12, borderRadius: 6, background: classi.color, flexShrink: 0 }} />
            Situação atual: {classi.label} ({ultima.valor} mg/dL)
          </div>
        )}
        {recs.map((r, i) => (
          <Card key={i} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", gap: 12 }}>
              <IconBadge Icon={r.Icon} bg={r.bg} color={r.color} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.4 }}>{r.texto}</div>
                <div style={{ fontSize: 12.5, color: COLORS.textMuted, marginTop: 6 }}>Fonte: {r.fonte}</div>
                {r.gatilho && GATILHO_CONDICAO[r.gatilho] && (
                  <button onClick={() => setAbertaExplicacao(abertaExplicacao === i ? null : i)}
                    style={{ background: "none", border: "none", color: COLORS.primary, fontWeight: 700, fontSize: 13.5, padding: "6px 0 0", cursor: "pointer" }}>
                    {abertaExplicacao === i ? "Ocultar explicação ▲" : "Por que recebi esta recomendação? ▾"}
                  </button>
                )}
                {abertaExplicacao === i && GATILHO_CONDICAO[r.gatilho] && (
                  <div style={{ fontSize: 13.5, color: COLORS.text, background: COLORS.bg, borderRadius: 10, padding: "8px 12px", marginTop: 6 }}>
                    {GATILHO_CONDICAO[r.gatilho]}
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
        <Disclaimer text="As recomendações são geradas por regras determinísticas a partir dos seus registros no GlyControl, com frases educativas de fontes confiáveis. Elas não substituem consulta médica ou nutricional." />
      </div>
    </div>
  );
}

/* ============================================================
   SUGESTÕES ALIMENTARES
   ============================================================ */

const SUGESTAO_BENEFICIOS = {
  "Maçã": "as fibras da maçã ajudam a evitar que sua glicemia suba rápido depois de comer.",
  "Aveia em flocos": "as fibras da aveia ajudam a reduzir a absorção de açúcar no sangue.",
  "Feijão carioca cozido": "as fibras e proteínas do feijão ajudam a manter sua glicemia mais estável e a dar mais saciedade.",
  "Feijão preto cozido": "as fibras e proteínas do feijão ajudam a manter sua glicemia mais estável e a dar mais saciedade.",
  "Castanha-do-pará": "as gorduras boas da castanha ajudam na saúde do coração, sem elevar muito sua glicemia.",
};

/* Fontes rápidas de açúcar, úteis apenas como referência educativa
   geral para momentos de glicemia muito baixa (regra dos 15g de
   carboidrato). Não substitui orientação médica sobre quantidades. */
const SUGESTAO_BENEFICIOS_HIPO = {
  "Suco de laranja": "é uma fonte rápida de açúcar, o que pode ajudar a levantar sua glicemia com mais agilidade.",
  "Mel de abelha": "é uma fonte de açúcar de ação imediata, o que pode ajudar a levantar sua glicemia rapidamente.",
  "Banana prata": "tem açúcares naturais de rápida absorção, o que pode ajudar a levantar sua glicemia.",
  "Água de coco": "ajuda a te hidratar e tem açúcares naturais que podem ajudar a levantar sua glicemia.",
  "Refrigerante comum": "é uma fonte rápida de açúcar, útil apenas em situações de emergência com glicemia muito baixa.",
};

function gerarSugestoesAlimentares(userData) {
  const glicemias = userData?.glicemias || [];
  const ultima = [...glicemias].sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora))[0];
  const ranges = getRangesDoUsuario(userData?.perfil);
  const classi = ultima ? classificarGlicemia(ultima.valor, ranges) : null;
  const isHipo = !!(classi && classi.label === "Perigoso" && ultima.valor <= ranges.perigosoBaixo);
  const isAltoRisco = !!(classi && !isHipo && (classi.label === "Perigoso" || classi.label === "Atenção"));

  if (isHipo) {
    const nomes = Object.keys(SUGESTAO_BENEFICIOS_HIPO);
    const itens = nomes.map(n => FOOD_DB.find(f => f.nome === n)).filter(Boolean);
    return { modo: "hipo", itens, beneficios: SUGESTAO_BENEFICIOS_HIPO };
  }

  const limiteCarb = isAltoRisco ? 20 : 30;
  const nomesPrioritarios = Object.keys(SUGESTAO_BENEFICIOS);
  const prioritarios = nomesPrioritarios.map(n => FOOD_DB.find(f => f.nome === n)).filter(Boolean);
  // Usa as tags (non_starchy_vegetable, legume, fruit, whole_grain, nuts_seeds)
  // para encontrar boas opções adicionais, evitando açúcares e ultraprocessados.
  const boasTags = ["non_starchy_vegetable", "legume", "whole_grain", "nuts_seeds", "fruit"];
  const outrosBons = FOOD_DB.filter(f =>
    f.fibra != null && f.fibra >= 2.5 && f.carb != null && f.carb < limiteCarb &&
    !nomesPrioritarios.includes(f.nome) &&
    !temTag(f, "sweet") && !temTag(f, "ultraprocessed") && !temTag(f, "sugary_drink") &&
    (f.tags || []).some(t => boasTags.includes(t))
  ).slice(0, 6);
  return { modo: isAltoRisco ? "alto" : "normal", itens: [...prioritarios, ...outrosBons], beneficios: SUGESTAO_BENEFICIOS };
}


const CATEGORY_ICON = {
  "Frutas": "🍎", "Frutas e derivados": "🍎", "Verduras e legumes": "🥦", "Hortaliças": "🥬",
  "Verduras, hortaliças e derivados": "🥬", "Leguminosas": "🫘", "Leguminosas e derivados": "🫘",
  "Oleaginosas": "🥜", "Nozes e sementes": "🥜", "Cereais": "🌾", "Carnes": "🥩", "Carnes e derivados": "🥩", "Aves": "🍗",
  "Peixes e frutos do mar": "🐟", "Pescados e frutos do mar": "🐟", "Laticínios": "🧀", "Pães": "🍞",
  "Bebidas": "🥤", "Bebidas (alcoólicas e não alcoólicas)": "🥤",
  "Doces e sobremesas": "🍫", "Tubérculos e raízes": "🥔", "Óleos e gorduras": "🫒",
  "Massas": "🍝", "Ovos": "🥚", "Industrializados": "📦", "Outros alimentos industrializados": "📦",
  "Temperos e condimentos": "🌿", "Preparações brasileiras": "🍛", "Alimentos preparados": "🍛",
  "Miscelâneas": "🍽️", "Outros": "🍽️",
};

function SugestoesAlimentaresScreen({ userData, onVoltar }) {
  const { modo, itens, beneficios } = useMemo(() => gerarSugestoesAlimentares(userData), [userData]);
  const ultima = [...(userData.glicemias || [])].sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora))[0];

  function frasePorque(nomeAlimento) {
    const explicacao = beneficios[nomeAlimento] || "faz parte de uma alimentação equilibrada e pode apoiar o controle glicêmico.";
    if (modo === "hipo") return `Bom para você agora porque sua glicemia está baixa (${ultima.valor} mg/dL): ${explicacao}`;
    if (modo === "alto") return `Bom para você agora porque sua glicemia está classificada como ${classificarGlicemia(ultima.valor, getRangesDoUsuario(userData.perfil)).label.toLowerCase()} (${ultima.valor} mg/dL): ${explicacao}`;
    return `Bom para você: ${explicacao}`;
  }

  return (
    <div>
      <TopBar title="Sugestões Alimentares" onBack={onVoltar} />
      <div style={{ padding: "10px 18px 30px" }}>
        {modo === "hipo" && (
          <div style={{ marginBottom: 16 }}>
            <Disclaimer text="Seu último registro de glicemia está muito baixo. As sugestões abaixo são fontes rápidas de açúcar, úteis apenas como referência geral. Se estiver com sintomas (tontura, tremores, suor frio), procure ajuda e converse com seu médico sobre a conduta adequada." />
          </div>
        )}
        {modo === "alto" && (
          <div style={{ marginBottom: 16 }}>
            <Disclaimer text="Seu último registro de glicemia está elevado ou em atenção. Priorizamos aqui alimentos com menos carboidratos e mais fibras." />
          </div>
        )}
        {itens.map(f => (
          <Card key={f.id} style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 800, fontSize: 16.5 }}>{f.nome}</div>
            <div style={{ fontSize: 14, color: COLORS.textMuted, margin: "2px 0" }}>{round1(f.carb)}g de carboidratos por 100g</div>
            <div style={{ fontSize: 14.5, color: COLORS.text, lineHeight: 1.4 }}>{frasePorque(f.nome)}</div>
          </Card>
        ))}
        <Disclaimer text="As sugestões alimentares têm caráter educativo, com base em fontes nutricionais (TACO/TBCA), e não substituem orientação de um nutricionista." />
      </div>
    </div>
  );
}

/* ============================================================
   TROCAS ALIMENTARES
   ------------------------------------------------------------
   Nunca tratamos alimentos como "proibidos" — a linguagem é de
   substituição, composição e frequência, conforme a aba
   "Trocas e alternativas" do banco de recomendações.
   ============================================================ */
function TrocasAlimentaresScreen({ onVoltar }) {
  const categorias = Object.keys(TROCAS_ALIMENTARES);
  return (
    <div>
      <TopBar title="Trocas Alimentares" onBack={onVoltar} />
      <div style={{ padding: "10px 18px 30px" }}>
        <div style={{ marginBottom: 16 }}>
          <Disclaimer text="Estas são sugestões de troca e variedade, não proibições. Sempre respeite suas preferências, alergias e orientações do seu médico ou nutricionista." />
        </div>
        {categorias.map(cat => (
          <Card key={cat} style={{ marginBottom: 14 }}>
            <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 10 }}>{cat}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {TROCAS_ALIMENTARES[cat].map(alt => (
                <span key={alt} style={{
                  background: COLORS.primaryLight, color: COLORS.primaryDark, fontWeight: 700,
                  fontSize: 14, padding: "7px 14px", borderRadius: 20,
                }}>{alt}</span>
              ))}
            </div>
          </Card>
        ))}
        <Disclaimer text="As trocas alimentares têm caráter educativo. Recalcular os nutrientes de uma nova opção e respeitar preferências e restrições continua sendo importante." />
      </div>
    </div>
  );
}

/* ============================================================
   E-MAIL DE BOAS-VINDAS
   ------------------------------------------------------------
   IMPORTANTE (leia antes de configurar um serviço real de e-mail):
   Este é um Artifact que roda inteiramente no navegador do usuário
   (sem servidor próprio). Por isso, ele NÃO tem como abrir uma
   conexão SMTP real nem enviar e-mails de verdade — navegadores não
   têm essa capacidade, e mesmo que tivessem, qualquer senha de
   e-mail colocada aqui no código ficaria visível para qualquer
   pessoa que abrisse o "código-fonte" do Artifact, o que exporia a
   conta de e-mail a uso indevido. Por isso, a senha do Gmail NÃO foi
   incluída neste arquivo.
   
   Esta função apenas SIMULA o envio (mostra uma confirmação na tela
   e grava um registro local do "e-mail" que seria enviado).
   
   PONTO DE INTEGRAÇÃO FUTURA (quando o projeto tiver um backend real):
   Crie um endpoint no servidor (ex.: POST /api/send-welcome-email)
   que use uma biblioteca como Nodemailer, com as credenciais do
   e-mail armazenadas em variáveis de ambiente no servidor (nunca no
   código do frontend). O Artifact então chamaria esse endpoint via
   fetch(). Exemplo de configuração apenas ilustrativo:
   
   const EMAIL_CONFIG = {
     remetente: "glycontroleducation@gmail.com",
     // A senha NUNCA deve ficar aqui. Deve ficar em uma variável de
     // ambiente no servidor, ex.: process.env.EMAIL_APP_PASSWORD
   };
   ============================================================ */

function montarEmailBoasVindas(nome) {
  const primeiroNome = (nome || "").trim().split(" ")[0] || "usuário(a)";
  return {
    de: "glycontroleducation@gmail.com",
    assunto: "Bem-vindo(a) ao GlyControl!",
    corpo: `Olá, ${primeiroNome}!\n\nSeja bem-vindo(a) ao GlyControl. Estamos felizes em te ajudar a acompanhar sua glicemia, alimentação e hidratação no dia a dia.\n\nQualquer dúvida, use a aba Ajuda ou o Chat do GlyControl dentro do app.\n\nUm abraço,\nEquipe GlyControl`,
  };
}

async function simularEnvioEmailBoasVindas(email, nome) {
  const mensagem = montarEmailBoasVindas(nome);
  const registro = { para: email, ...mensagem, enviadoEm: nowISO() };
  const log = (await storageGet("gc:emailLog", false)) || [];
  await storageSet("gc:emailLog", [...log, registro], false);
  return registro;
}

function MaisScreen({ onNavigate }) {
  const items = [
    { key: "relatorios", label: "Relatórios e Gráficos", Icon: BarChart2, color: COLORS.primary, bg: COLORS.primaryLight },
    { key: "chat", label: "Chat GlyControl", Icon: MessageCircle, color: COLORS.blue, bg: COLORS.blueBg },
    { key: "comunidade", label: "Comunidade", Icon: Users, color: COLORS.purple, bg: COLORS.purpleBg },
    { key: "calendario", label: "Calendário", Icon: Calendar, color: COLORS.primary, bg: COLORS.primaryLight },
    { key: "recomendacoes", label: "Recomendações", Icon: Sparkles, color: COLORS.blue, bg: COLORS.blueBg },
    { key: "sugestoes", label: "Sugestões Alimentares", Icon: Salad, color: COLORS.purple, bg: COLORS.purpleBg },
    { key: "historicoAlimentar", label: "Histórico Alimentar", Icon: Utensils, color: COLORS.primary, bg: COLORS.primaryLight },
    { key: "perfil", label: "Perfil e Configurações", Icon: User, color: COLORS.blue, bg: COLORS.blueBg },
    { key: "ajuda", label: "Ajuda", Icon: HelpCircle, color: COLORS.purple, bg: COLORS.purpleBg },
  ];
  return (
    <div>
      <div style={{ padding: "22px 18px 10px" }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, margin: 0, color: COLORS.text }}>Mais opções</h1>
      </div>
      <div style={{ padding: "10px 18px 30px" }}>
        {items.map(it => (
          <button key={it.key} onClick={() => onNavigate(it.key)} style={{
            width: "100%", display: "flex", alignItems: "center", gap: 14, background: "#fff",
            border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: "16px", marginBottom: 12,
            cursor: "pointer", textAlign: "left",
          }}>
            <IconBadge Icon={it.Icon} bg={it.bg} color={it.color} />
            <span style={{ flex: 1, fontSize: 17, fontWeight: 700, color: COLORS.text }}>{it.label}</span>
            <ChevronRight size={22} color={COLORS.textMuted} />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   APP PRINCIPAL
   ============================================================ */

const STATIC_TEXTS = {
  seguranca: {
    title: "Segurança e LGPD",
    paragraphs: [
      "Dados relacionados à saúde são sensíveis. O GlyControl foi pensado para, em uma versão real, seguir os princípios da Lei Geral de Proteção de Dados (LGPD).",
      "Nesta versão de protótipo, os dados ficam salvos apenas associados ao seu uso do GlyControl, para fins de teste e demonstração.",
      "Uma versão futura deverá contar com autenticação segura, criptografia de senhas, controle de acesso e políticas claras de privacidade.",
    ],
  },
  privacidade: {
    title: "Política de Privacidade",
    paragraphs: [
      "O GlyControl coleta apenas as informações necessárias para o funcionamento do sistema: dados de cadastro, registros de glicemia, alimentação e hidratação.",
      "Seus dados não são compartilhados com terceiros nesta versão de protótipo.",
      "Você pode editar ou excluir seus dados a qualquer momento na tela de Perfil.",
    ],
  },
  acessibilidade: {
    title: "Declaração de Acessibilidade",
    paragraphs: [
      "O GlyControl foi desenvolvido priorizando o uso por pessoas idosas: fontes grandes e ajustáveis, botões grandes, alto contraste e navegação simples.",
      "Buscamos evitar menus escondidos, textos pequenos e elementos difíceis de tocar.",
      "Se você encontrar dificuldades de uso, conte com a aba Ajuda ou o Chat do GlyControl.",
    ],
  },
};

export default function GlyControlApp() {
  const [carregando, setCarregando] = useState(true);
  const [fase, setFase] = useState("splash"); // splash | onboarding | login | cadastro | esqueci | app
  const [usuarios, setUsuarios] = useState({});
  const [sessionEmail, setSessionEmail] = useState(null);
  const [userData, setUserData] = useState(null);
  const [erroLogin, setErroLogin] = useState("");
  const [erroCadastro, setErroCadastro] = useState("");
  const [community, setCommunity] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [toast, setToast] = useState("");
  const [chatNaoLido, setChatNaoLido] = useState(false);
  const [rascunhoRefeicao, setRascunhoRefeicao] = useState({ tipo: "", itens: [] });
  const [stack, setStack] = useState([]); // pilha de navegação dentro do app

  // Carregamento inicial
  useEffect(() => {
    (async () => {
      const users = await storageGet("gc:users", false);
      const session = await storageGet("gc:session", false);
      const comm = await storageGet("gc:community", true);
      setUsuarios(users || {});
      setCommunity(comm || []);
      if (session && session.email && users && users[session.email]) {
        const data = await storageGet(`gc:userdata:${session.email}`, false);
        if (data) {
          setSessionEmail(session.email);
          setUserData(data);
          const chat = await storageGet(`gc:chat:${session.email}`, false);
          setChatMessages(chat || []);
          setFase("app");
        }
      }
      setCarregando(false);
    })();
  }, []);

  function showToast(msg) { setToast(msg); }

  function navigate(screen) {
    if (screen === "chat") setChatNaoLido(false);
    setStack(s => [...s, screen]);
  }
  function voltar() {
    setStack(s => s.slice(0, -1));
  }
  function irParaHome() {
    setStack([]);
  }

  async function persistUserData(nextData) {
    setUserData(nextData);
    if (sessionEmail) await storageSet(`gc:userdata:${sessionEmail}`, nextData, false);
  }

  async function handleCadastrar({ nome, email, senha, idade, sexo }) {
    const currentUsers = (await storageGet("gc:users", false)) || {};
    if (currentUsers[email]) {
      setErroCadastro("Já existe uma conta com esse e-mail.");
      return;
    }
    const perfil = novoPerfil({ nome, email, idade, sexo });
    const novoUsuarios = { ...currentUsers, [email]: { ...perfil, senhaHash: hashSimples(senha) } };
    await storageSet("gc:users", novoUsuarios, false);
    setUsuarios(novoUsuarios);
    const data = novoUserData(perfil);
    await storageSet(`gc:userdata:${email}`, data, false);
    await storageSet("gc:session", { email }, false);
    setSessionEmail(email);
    setUserData(data);
    setErroCadastro("");
    setFase("app");
    setStack([]);
    await simularEnvioEmailBoasVindas(email, nome);
    showToast(`E-mail de boas-vindas enviado para ${email}`);
  }

  async function handleLogin(email, senha) {
    const currentUsers = (await storageGet("gc:users", false)) || usuarios;
    const u = currentUsers[email];
    if (!u || u.senhaHash !== hashSimples(senha)) {
      setErroLogin("E-mail ou senha incorretos.");
      return;
    }
    setErroLogin("");
    const data = (await storageGet(`gc:userdata:${email}`, false)) || novoUserData(u);
    await storageSet("gc:session", { email }, false);
    setSessionEmail(email);
    setUserData(data);
    const chat = (await storageGet(`gc:chat:${email}`, false)) || [];
    setChatMessages(chat);
    setFase("app");
    setStack([]);
    await simularEnvioEmailBoasVindas(email, data.perfil?.nome);
    showToast(`E-mail de boas-vindas enviado para ${email}`);
  }

  async function handleRedefinirSenha(email, novaSenha) {
    const currentUsers = (await storageGet("gc:users", false)) || usuarios;
    if (!currentUsers[email]) return;
    const atualizado = { ...currentUsers, [email]: { ...currentUsers[email], senhaHash: hashSimples(novaSenha) } };
    await storageSet("gc:users", atualizado, false);
    setUsuarios(atualizado);
  }

  async function handleSair() {
    await storageSet("gc:session", null, false);
    setSessionEmail(null);
    setUserData(null);
    setFase("login");
    setStack([]);
  }

  async function handleExcluirConta() {
    const currentUsers = (await storageGet("gc:users", false)) || usuarios;
    const email = sessionEmail;
    const atualizado = { ...currentUsers };
    delete atualizado[email];
    await storageSet("gc:users", atualizado, false);
    setUsuarios(atualizado);
    await storageSet("gc:session", null, false);
    setSessionEmail(null);
    setUserData(null);
    setFase("login");
    setStack([]);
  }

  function handleSalvarPerfil(novoPerfilObj) {
    persistUserData({ ...userData, perfil: novoPerfilObj });
    showToast("Perfil atualizado!");
  }

  async function handleSalvarGlicemia(registro, aguaMlOpcional) {
    const g = { id: uid("gli"), ...registro };
    let novaData = { ...userData, glicemias: [...userData.glicemias, g] };
    if (aguaMlOpcional) {
      novaData = { ...novaData, agua: [...novaData.agua, { id: uid("agua"), ml: aguaMlOpcional, dataHora: registro.dataHora }] };
    }
    persistUserData(novaData);
    showToast("Glicemia registrada com sucesso!");
    setStack(["historicoGlicemia"]);

    // Se a glicemia estiver em Atenção ou Perigoso, a Ana entra em
    // contato pelo chat, sem esperar o usuário perguntar.
    const classi = classificarGlicemia(g.valor, getRangesDoUsuario(userData.perfil));
    if (classi.label === "Atenção" || classi.label === "Perigoso") {
      const mensagemAna = { pergunta: null, resposta: gerarMensagemProativaGlicemia(g, userData.perfil), ts: nowISO(), proativa: true };
      const novoChat = [...chatMessages, mensagemAna];
      setChatMessages(novoChat);
      setChatNaoLido(true);
      if (sessionEmail) await storageSet(`gc:chat:${sessionEmail}`, novoChat, false);
    }
  }

  function handleSalvarRefeicao(refeicao) {
    const r = { id: uid("ref"), ...refeicao };
    persistUserData({ ...userData, refeicoes: [...userData.refeicoes, r] });
    showToast("Refeição salva com sucesso!");
  }

  function handleRegistrarAgua(ml) {
    const a = { id: uid("agua"), ml, dataHora: nowISO() };
    persistUserData({ ...userData, agua: [...userData.agua, a] });
    showToast(`+${ml} ml de água registrados!`);
  }

  function handleAtualizarMetaAgua(meta) {
    persistUserData({ ...userData, perfil: { ...userData.perfil, metaAguaMl: Number(meta) } });
    showToast("Meta de água atualizada!");
  }

  async function handleEnviarChat(pergunta, resposta) {
    const nova = [...chatMessages, { pergunta, resposta, ts: nowISO() }];
    setChatMessages(nova);
    if (sessionEmail) await storageSet(`gc:chat:${sessionEmail}`, nova, false);
  }

  async function handlePublicarPost(conteudo) {
    const post = {
      id: uid("post"), autorNome: userData.perfil.nome, autorEmail: userData.perfil.email,
      conteudo, criadoEm: nowISO(), curtidas: 0, curtidoPor: [],
    };
    const nova = [...community, post];
    setCommunity(nova);
    await storageSet("gc:community", nova, true);
  }

  async function handleCurtirPost(postId) {
    const nova = community.map(p => {
      if (p.id !== postId) return p;
      const jaCurtiu = p.curtidoPor?.includes(userData.perfil.email);
      return {
        ...p,
        curtidas: jaCurtiu ? (p.curtidas || 1) - 1 : (p.curtidas || 0) + 1,
        curtidoPor: jaCurtiu ? p.curtidoPor.filter(e => e !== userData.perfil.email) : [...(p.curtidoPor || []), userData.perfil.email],
      };
    });
    setCommunity(nova);
    await storageSet("gc:community", nova, true);
  }

  if (carregando) {
    return (
      <div style={{ minHeight: "100vh", background: COLORS.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <img src={LOGO_DATA_URI} alt="Carregando GlyControl" style={{ width: 64, height: 64, objectFit: "contain" }} />
      </div>
    );
  }

  if (fase !== "app") {
    let content;
    if (fase === "splash") content = <SplashScreen onContinue={() => setFase("onboarding")} onLogin={() => setFase("login")} />;
    else if (fase === "onboarding") content = <OnboardingScreen onFinish={() => setFase("login")} />;
    else if (fase === "login") content = <LoginScreen onLogin={handleLogin} onGoCadastro={() => { setErroCadastro(""); setFase("cadastro"); }} onGoEsqueci={() => setFase("esqueci")} error={erroLogin} />;
    else if (fase === "cadastro") content = <CadastroScreen onCadastrar={handleCadastrar} onVoltar={() => setFase("login")} erroExterno={erroCadastro} />;
    else if (fase === "esqueci") content = <EsqueciSenhaScreen onVoltar={() => setFase("login")} onRedefinir={handleRedefinirSenha} usuarios={usuarios} />;
    return (
      <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>{content}</div>
    );
  }

  const fontScale = Number(userData?.perfil?.fontScale) || 1;
  const topoStack = stack[stack.length - 1];

  let screenContent = null;

  if (topoStack) {
    switch (topoStack) {
      case "perfil":
        screenContent = <PerfilScreen userData={userData} onSalvarPerfil={handleSalvarPerfil} onSair={handleSair} onExcluirConta={handleExcluirConta} onVoltar={voltar} onNavigate={navigate} />;
        break;
      case "chat":
        screenContent = <ChatScreen userData={userData} mensagens={chatMessages} onEnviar={handleEnviarChat} onVoltar={voltar} />;
        break;
      case "calendario":
        screenContent = <CalendarioScreen userData={userData} onVoltar={voltar} />;
        break;
      case "registrarGlicemia":
        screenContent = <RegistrarGlicemiaScreen onSalvar={handleSalvarGlicemia} onVoltar={voltar} />;
        break;
      case "historicoGlicemia":
        screenContent = <GlicemiaHistoricoScreen userData={userData} onVoltar={voltar} onNovo={() => navigate("registrarGlicemia")} />;
        break;
      case "historicoAlimentar":
        screenContent = <HistoricoAlimentarScreen userData={userData} onVoltar={voltar} />;
        break;
      case "alimentacao":
        screenContent = <AlimentacaoScreen userData={userData} onSalvarRefeicao={handleSalvarRefeicao} onVoltar={voltar} onVerHistorico={() => navigate("historicoAlimentar")} rascunho={rascunhoRefeicao} onMudarRascunho={setRascunhoRefeicao} />;
        break;
      case "agua":
        screenContent = <AguaScreen userData={userData} onRegistrarAgua={handleRegistrarAgua} onAtualizarMeta={handleAtualizarMetaAgua} onVoltar={voltar} />;
        break;
      case "relatorios":
        screenContent = <RelatoriosScreen userData={userData} onVoltar={voltar} />;
        break;
      case "comunidade":
        screenContent = <ComunidadeScreen perfil={userData.perfil} posts={community} onPublicar={handlePublicarPost} onCurtir={handleCurtirPost} onVoltar={voltar} />;
        break;
      case "ajuda":
        screenContent = <AjudaScreen onVoltar={voltar} />;
        break;
      case "recomendacoes":
        screenContent = <RecomendacoesScreen userData={userData} onVoltar={voltar} />;
        break;
      case "sugestoes":
        screenContent = <SugestoesAlimentaresScreen userData={userData} onVoltar={voltar} />;
        break;
      case "trocas":
        screenContent = <TrocasAlimentaresScreen onVoltar={voltar} />;
        break;
      case "seguranca":
      case "privacidade":
      case "acessibilidade":
        screenContent = <StaticInfoScreen title={STATIC_TEXTS[topoStack].title} paragraphs={STATIC_TEXTS[topoStack].paragraphs} onVoltar={voltar} />;
        break;
      default:
        screenContent = null;
    }
  } else {
    screenContent = <HomeScreen userData={userData} onNavigate={navigate} />;
  }

  return (
    <div style={{
      fontFamily: "'Segoe UI', system-ui, sans-serif", background: COLORS.bg, minHeight: "100vh",
      maxWidth: 480, margin: "0 auto", position: "relative", display: "flex", flexDirection: "column",
      zoom: fontScale, MozTransform: `scale(${fontScale})`, MozTransformOrigin: "top center",
    }}>
      <div style={{ padding: "14px 18px 0" }}>
        <TopShortcuts onNavigate={navigate} chatNaoLido={chatNaoLido} />
      </div>
      <div style={{ flex: 1, paddingBottom: 4 }}>
        {screenContent}
      </div>
      <HomeBar onHome={irParaHome} />
      <Toast message={toast} onClose={() => setToast("")} />
    </div>
  );
}
