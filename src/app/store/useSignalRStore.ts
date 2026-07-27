import { create } from 'zustand';
import { HubConnectionBuilder, HubConnection, HubConnectionState } from '@microsoft/signalr';

interface SignalRState {
  connection: HubConnection | null;
  isConnected: boolean;
  examSessionId: string | null;
  plagiarismAlerts: any[];
  progressUpdates: Record<string, any>; // mapped by itemId
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  joinExamGroup: (examId: string) => Promise<void>;
  leaveExamGroup: (examId: string) => Promise<void>;
  clearAlerts: () => void;
}

export const useSignalRStore = create<SignalRState>((set, get) => ({
  connection: null,
  isConnected: false,
  examSessionId: null,
  plagiarismAlerts: [],
  progressUpdates: {},

  connect: async () => {
    const currentConnection = get().connection;
    if (currentConnection && (currentConnection.state === HubConnectionState.Connected || currentConnection.state === HubConnectionState.Connecting)) {
      return;
    }

    const connection = new HubConnectionBuilder()
      .withUrl('/gradingHub')
      .withAutomaticReconnect()
      .build();

    set({ connection });

    connection.on('PlagiarismAlert', (message) => {
      set((state) => {
        // If the message is a string JSON, parse it
        let alertData = message;
        if (typeof message === 'string') {
          try { alertData = JSON.parse(message); } catch (e) {}
        }
        return { plagiarismAlerts: [...state.plagiarismAlerts, alertData] };
      });
    });

    connection.on('UpdateProgress', (message) => {
       set((state) => {
          let progressData = message;
          if (typeof message === 'string') {
             try { progressData = JSON.parse(message); } catch (e) {}
          }
          if (progressData && progressData.ItemId) {
             return {
                progressUpdates: {
                   ...state.progressUpdates,
                   [progressData.ItemId]: progressData
                }
             };
          }
          return state;
       });
    });

    try {
      await connection.start();
      set({ connection, isConnected: true });
      console.log('Connected to SignalR Hub');
      
      const currentExam = get().examSessionId;
      if (currentExam) {
         await connection.invoke('JoinExamGroup', currentExam);
      }
    } catch (err) {
      console.error('SignalR Connection Error: ', err);
      set({ isConnected: false });
    }
  },

  disconnect: async () => {
    const { connection, examSessionId } = get();
    if (connection) {
      if (examSessionId) {
        try {
          await connection.invoke('LeaveExamGroup', examSessionId);
        } catch (e) {
          console.error(e);
        }
      }
      await connection.stop();
      set({ connection: null, isConnected: false, examSessionId: null });
    }
  },

  joinExamGroup: async (examId: string) => {
    const { connection, examSessionId } = get();
    if (examSessionId === examId) return;

    if (connection?.state === HubConnectionState.Connected) {
      if (examSessionId) {
        try { await connection.invoke('LeaveExamGroup', examSessionId); } catch(e) {}
      }
      try {
        await connection.invoke('JoinExamGroup', examId);
        set({ examSessionId: examId });
      } catch(e) {
        console.error('Error joining group', e);
      }
    } else {
      set({ examSessionId: examId }); // Will join upon connect
      get().connect();
    }
  },

  leaveExamGroup: async (examId: string) => {
    const { connection, examSessionId } = get();
    if (connection?.state === HubConnectionState.Connected && examSessionId === examId) {
       try {
          await connection.invoke('LeaveExamGroup', examId);
          set({ examSessionId: null });
       } catch (e) {
          console.error('Error leaving group', e);
       }
    }
  },

  clearAlerts: () => set({ plagiarismAlerts: [] })
}));
