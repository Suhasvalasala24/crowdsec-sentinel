import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

interface Rule {
  id: string;
  name: string;
  description: string;
}

const RuleList = () => {
  const [rules, setRules] = useState<Rule[]>([]);

  useEffect(() => {
    fetch("http://localhost:8000/rules/list")
      .then((res) => res.json())
      .then((data) => setRules(data.rules || []))
      .catch((err) => console.error("Error fetching rules:", err));
  }, []);

  return (
    <div className="space-y-3">
      {rules.length === 0 ? (
        <p className="text-muted-foreground">No rules available</p>
      ) : (
        rules.map((rule) => (
          <Card key={rule.id} className="p-4 bg-gray-800 border border-gray-700">
            <h3 className="text-lg font-semibold text-white">{rule.name}</h3>
            <p className="text-sm text-gray-400">{rule.description}</p>
          </Card>
        ))
      )}
    </div>
  );
};

export default RuleList;
