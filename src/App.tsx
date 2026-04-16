import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import Index from "./pages/Index";
import Products from "./pages/Products";
import Inventory from "./pages/Inventory";
import Costs from "./pages/Costs";
import Pricing from "./pages/Pricing";
import Competitors from "./pages/Competitors";
import POS from "./pages/POS";
import Suppliers from "./pages/Suppliers";
import Payables from "./pages/Payables";
import Invoices from "./pages/Invoices";
import StockMovements from "./pages/StockMovements";
import CashFlow from "./pages/CashFlow";
import Receivables from "./pages/Receivables";
import Customers from "./pages/Customers";
import Profitability from "./pages/Profitability";
import Replenishment from "./pages/Replenishment";
import ABCCurve from "./pages/ABCCurve";
import Goals from "./pages/Goals";
import Audit from "./pages/Audit";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner richColors position="top-right" />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/produtos" element={<Products />} />
            <Route path="/estoque" element={<Inventory />} />
            <Route path="/custos" element={<Costs />} />
            <Route path="/precificacao" element={<Pricing />} />
            <Route path="/concorrencia" element={<Competitors />} />
            <Route path="/caixa" element={<POS />} />
            <Route path="/fornecedores" element={<Suppliers />} />
            <Route path="/contas-pagar" element={<Payables />} />
            <Route path="/notas-fiscais" element={<Invoices />} />
            <Route path="/movimentacoes" element={<StockMovements />} />
            <Route path="/fluxo-caixa" element={<CashFlow />} />
            <Route path="/contas-receber" element={<Receivables />} />
            <Route path="/clientes" element={<Customers />} />
            <Route path="/rentabilidade" element={<Profitability />} />
            <Route path="/reposicao" element={<Replenishment />} />
            <Route path="/curva-abc" element={<ABCCurve />} />
            <Route path="/metas" element={<Goals />} />
            <Route path="/auditoria" element={<Audit />} />
            <Route path="/configuracoes" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
