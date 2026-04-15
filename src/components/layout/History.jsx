import { useStore } from '../../store/useStore'
import { formatINR } from '../../utils/formatters';
export default function History(){
    const { expenses,isSyncing } = useStore();
    return (
        <section className="px-2 pb-20">
          <div className="flex items-center justify-between mb-8 border-b border-stone-50 pb-2">
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-sans font-bold">Recent Debits</h3>
            <span className="text-[10px] text-stone-300 font-sans italic">{expenses.length} Entries</span>
          </div>

          <div className="space-y-10">
            {expenses.length === 0 && !isSyncing ? (
              <div className="text-center py-20">
                <p className="text-stone-300 italic font-light">The ledger is currently silent.</p>
              </div>
            ) : (
              expenses.map((exp) => (
                <div key={exp.id} className="group flex items-start justify-between border-b border-stone-50 pb-8 hover:border-stone-100 transition-colors">
                  <div className="flex gap-6">
                    <div className="text-[10px] uppercase tracking-tighter text-stone-300 font-sans pt-1.5 w-12 shrink-0">
                      {new Date(exp.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </div>
                    <div>
                      <h4 className="text-lg font-light text-stone-800 leading-none mb-1 italic group-hover:text-stone-900 transition-colors">{exp.description}</h4>
                      {exp.merchant && (
                        <p className="text-[10px] uppercase tracking-widest text-stone-400 font-sans mb-3 flex items-center gap-1.5">
                          <MapPin className="w-2.5 h-2.5" strokeWidth={1.5} /> {exp.merchant}
                        </p>
                      )}
                      <span className="text-[9px] uppercase tracking-[0.15em] text-stone-400 font-sans font-bold bg-stone-50 px-2 py-0.5 rounded-sm">{exp.category}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-lg font-light text-stone-800 tracking-tight">₹{formatINR(exp.amount)}</span>
                    <button onClick={() => deleteExpense(exp.id)} className="opacity-0 group-hover:opacity-100 p-1 text-stone-200 hover:text-stone-800 transition-all">
                      <Trash2 className="w-4 h-4" strokeWidth={1.2} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
    )
}