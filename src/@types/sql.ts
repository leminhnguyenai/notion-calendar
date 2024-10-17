export type Option = {
  name: string;
  value: string;
};

export type FormattedConnType = {
  calendarId: string;
  calendarName: string;
  date: Option;
  name: Option;
  description?: Option;
  doneMethod?: Option;
  doneMethodOption?: Option;
};

export type UnFormattedConnType = {
  calendar_id: string;
  calendar_name: string;
  date: Option;
  name: Option;
  description?: Option;
  done_method?: Option;
  done_method_option?: Option;
};
