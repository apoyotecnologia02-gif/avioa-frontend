import type {TransferVoucher} from '@/lib/auxiliary-operational/domain/aux-transfer';
import {transferFlightDetails,transferLongDate} from '@/lib/auxiliary-operational/domain/transfer-flight-details';

export default function TransferFlightPreview({voucher:v,hasImages=false}:{voucher:TransferVoucher;hasImages?:boolean}){
 const compact=hasImages||!!v.images?.length;
 const showReturn=v.service==='roundtrip'||!!(v.returnDate||v.returnFlight||v.returnTime);
 return <div className="aux-flight-columns">{[false,true].map(returning=>{
  const flight=transferFlightDetails(v,returning);
  return <section key={String(returning)}><h4>{returning?'REGRESO':'IDA'}</h4>{returning&&!showReturn?<p>Sin datos de regreso registrados.</p>:<dl>{[
   [returning?'Fecha de regreso':'Fecha del servicio',transferLongDate(returning?v.returnDate:v.date)],
   ['Aerolínea',flight.airline],['Número de vuelo',flight.number],
   [v.sourceRequestId?'Hora del vuelo':'Hora',returning?v.returnTime:v.time]
  ].filter(([,value])=>!compact||!!value&&value!=='Por confirmar').map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value||'Por confirmar'}</dd></div>)}</dl>}</section>;
 })}</div>;
}
